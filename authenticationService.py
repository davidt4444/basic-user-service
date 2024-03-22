import os
import shutil
from datetime import datetime, timedelta
import hashlib
import string 
import random

from typing import Union
# python 3.10
# from typing import Annotated
# python 3.8
from typing import Union
from typing_extensions import Annotated

from fastapi import FastAPI, Form, Request, Response, Header, Cookie
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel

from mysql.connector import connect, Error


app = FastAPI()

cnf_filepath="../aws-resources/localhost-mac.cnf"
# cnf_filepath="../aws-resources/localhost.cnf"
# cnf_filepath="../aws-resources/thenameofyourbrand.cnf"
# cnf_filepath='example.cnf'

# You are going to want to change this to the address of your front end
origins = [
    "http://127.0.0.1",
    "https://127.0.0.1",
    "http://127.0.0.1:8080",
    "https://127.0.0.1:8080",
    "null",
]

# I didn't build out security for this.
# As such, for production, there are some things that should be changed
# Since there isn't an auth setup in place, you will not need cookies
# allow_credentials=false
# You are going to want to change allow methods to allow_methods=["POST","PUT"],
# Although, you should be able to comment it out for this default behavior
# You also should be able to comment out allow_headers for default behavior
# Accept, Accept-Language, Content-Language and Content-Type should
# still be allowed in that case
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class User(BaseModel):
    id:int
    uniqueId:str
    username:str
    email:str
    roles:str
    password:str

class UserTrim(BaseModel):
    username:str
    email:str
    roles:str
    password:str

class Login(BaseModel):
    username:str
    password:str

# The request.client.host is the ip address of the client computer 
# The request.client.port is a randomly assigned port between 
# 49152 and 65535 as a part of the dynamic, private or ephemeral ports
# Each port represents an instance of the request by the browser on 
# the computer. It will change over a series of requests.
class HashAgent(BaseModel):
    hash:str
    userAgent:str
    host:str
    port:int
    date:datetime
    user:User
    requestType:str
    requestPath:str

agentList = []
jwt_token = "busToken"

def clearHash(pos:int, uniqueId:str="", host:str=""):
    now = datetime.now()
    if pos<len(agentList):
        if now-timedelta(hours=1) > agentList[pos].date:
            agentList.pop(pos)
            clearHash(pos)
        elif agentList[pos].user.uniqueId==uniqueId:
            agentList.pop(pos)
            clearHash(pos)
        elif agentList[pos].host==host:
            agentList.pop(pos)
            clearHash(pos)
        else:
            clearHash(pos+1)
        
def checkHash(input:HashAgent):
    return_value = None
    # now = datetime.now()
    # [x for x in agentList if x.date>(now-timedelta(hours=1))]
    # for i in range(0,len(agentList)):
    #     if now-timedelta(hours=1) > agentList[i].date:
    #         agentList.pop(i)
    clearHash(0)
    for i in range(0,len(agentList)):
        # I removed the restriction on port to allow the session
        # to cross tabs and account for the port changing in 
        # the same tab in some cases
        if agentList[i].hash==input.hash and agentList[i].userAgent==input.userAgent and agentList[i].host==input.host:# and agentList[i].port==input.port:
            agentList[i].date = datetime.now()
            return_value= agentList[i].user
    return return_value

def createUserTable():
    try:
        conn = connect(option_files =
        cnf_filepath)
        
        # open cursor, define and run query
        cursor = conn.cursor()
        query = 'CREATE TABLE User ( \
        id BIGINT key NOT NULL AUTO_INCREMENT,\
        uniqueId CHAR(36) NOT NULL DEFAULT (UUID()),\
        username VARCHAR(20), \
        email VARCHAR(50), \
        roles VARCHAR(255), \
        password varchar(32)\
        );'
        cursor.execute(query)
        # close the cursor and database connection
        cursor.close()
        conn.close()
    except Error as err:
        print('Error message: ' + err.msg)

def dropUserTable():
    try:
        conn = connect(option_files =
        cnf_filepath)
        
        # open cursor, define and run query
        cursor = conn.cursor()
        query = 'drop table User;'
        cursor.execute(query)
        # close the cursor and database connection
        cursor.close()
        conn.close()
    except Error as err:
        print('Error message: ' + err.msg)

def truncateUserTable():
    try:
        conn = connect(option_files =
        cnf_filepath)
        
        # open cursor, define and run query
        cursor = conn.cursor()
        query = 'truncate table User;'
        cursor.execute(query)
        # close the cursor and database connection
        cursor.close()
        conn.close()
    except Error as err:
        print('Error message: ' + err.msg)

# Create a new user 
def insertIntoUserTable(userInput: User):
    try:
        conn = connect(option_files =
        cnf_filepath)
        
        # open cursor, define and run query, fetch results
        cursor = conn.cursor()
        query = 'insert into User(\
            username,\
            email,\
            roles,\
            password\
            )\
        values( %s,\
                %s,\
                "",\
                md5(%s)\
            );'
        cursor.execute(query, (userInput.username, userInput.email, userInput.password,))
        conn.commit()
        result = cursor.lastrowid

        # close the cursor and database connection
        cursor.close()
        conn.close()
        return result
    except Error as err:
        print('Error message: ' + err.msg)

# Read all users 
def selectAllFromUserTable():
    try:
        conn = connect(option_files =
        cnf_filepath)
        
        # open cursor, define and run query, fetch results
        cursor = conn.cursor()
        query = 'select id, uniqueId, username, email, roles, password from User;'
        cursor.execute(query)
        result = cursor.fetchall()
        
        return_list = []
        for r in result:
            value = User(id=r[0], uniqueId=r[1], username=r[2], email=r[3], roles=r[4], password=r[5])
            return_list.append(value)
        
        # close the cursor and database connection
        cursor.close()
        conn.close()
        return return_list
    except Error as err:
        print('Error message: ' + err.msg)

# Read a user by username and password 
def selectFromUserTableByLogin(log:Login):
    try:
        conn = connect(option_files =
        cnf_filepath)
        
        # open cursor, define and run query, fetch results
        cursor = conn.cursor()
        query = 'select id, uniqueId, username, email, roles, password from User where username=%s and password=md5(%s);'
        cursor.execute(query, (log.username,log.password,))
        result = cursor.fetchall()
        
        return_list = []
        for r in result:
            value = User(id=r[0], uniqueId=r[1], username=r[2], email=r[3], roles=r[4], password=r[5])
            return_list.append(value)
        
        # close the cursor and database connection
        cursor.close()
        conn.close()
        return return_list
    except Error as err:
        print('Error message: ' + err.msg)

# Update a user  
def updateUserInTable(userInput: User):
    try:
        conn = connect(option_files =
        cnf_filepath)
        
        # open cursor, define and run query, fetch results
        cursor = conn.cursor()
        query = "update User set\
            username=%s,\
            email=%s,\
            roles=%s\
            ";
        if userInput.password=="":
            query += "where uniqueId=%s\
            ;"
            cursor.execute(query, (userInput.username, userInput.email, userInput.roles, userInput.uniqueId,))
        else:
            query = ",password=md5(%s)\
                where uniqueId=%s\
            ;"
            cursor.execute(query, (userInput.username, userInput.email, userInput.roles, userInput.password, userInput.uniqueId,))
        conn.commit()
        result = cursor.lastrowid

        # close the cursor and database connection
        cursor.close()
        conn.close()
        return result
    except Error as err:
        print('Error message: ' + err.msg)

# Delete a user by id  
def deleteFromUserTableById(id: int):
    try:
        conn = connect(option_files =
        cnf_filepath)
        
        # open cursor, define and run query, fetch results
        cursor = conn.cursor()
        query = 'delete from User where id=%s;'
        cursor.execute(query, (id,))
        result = cursor.rowcount
        conn.commit()
        # close the cursor and database connection
        cursor.close()
        conn.close()
        return result
    except Error as err:
        print('Error message: ' + err.msg)

# POST authenticate a user 
@app.post("/auth/signin")
def authenticateUser(loginInput: Login, request: Request, response:Response,user_agent: Annotated[Union[str, None], Header()] = None):
    result = selectFromUserTableByLogin(loginInput)
    for r in result:
        user = r
        userHash = hashlib.md5(((user.username.join(random.SystemRandom().choice(string.ascii_uppercase + string.digits) for _ in range(20)))).encode('utf-8')).hexdigest()
        logRequest = HashAgent(hash=userHash, userAgent=user_agent, host=request.client.host, port=request.client.port, date=datetime.now(), user=user, requestType="POST", requestPath="/auth/signin")
        agentList.append(logRequest)
        response.set_cookie(key=jwt_token, 
                            value=userHash,
                            httponly=True,
                            secure=True,
                            samesite='None',
        )
        return {
            "id": user.id,
            "uniqueId":user.uniqueId,
            "username":user.username,
            "email":user.email,
            "roles":user.roles,
            "cookie":userHash
        }

    return {"response":"Could not authenticate"}

# POST authenticate a user 
@app.post("/auth/signout")
def logout(response:Response, busToken: Union[str, None] = Cookie(default=None)):
    for i in range(0, len(agentList)-1):
        if agentList[i].hash == busToken:
            agentList.pop(i)
    response.set_cookie(key=jwt_token, 
                        value=None,
                        httponly=True,
                        secure=True,
                        samesite='None',
    )
    return {"response":"You've been signed out!"}

# POST create a user 
@app.post("/auth/signup")
def postUser(userTrim: UserTrim, request: Request,user_agent: Annotated[Union[str, None], Header()] = None, busToken: Union[str, None] = Cookie(default=None)):
    user = User(id=0, uniqueId="", username=userTrim.username, email=userTrim.email, roles=userTrim.roles, password=userTrim.password)
    logRequest = HashAgent(hash=busToken, userAgent=user_agent, host=request.client.host, port=request.client.port, user=user, date=datetime.now(), requestType="POST", requestPath="/User")
    insertIntoUserTable(user)
    return { "response":"User registered successfully!" }

# GTT read all users 
@app.get("/User")
def getUsers(request: Request,user_agent: Annotated[Union[str, None], Header()] = None, busToken: Union[str, None] = Cookie(default=None)):
    logRequest = HashAgent(hash=busToken, userAgent=user_agent, host=request.client.host, port=request.client.port, user=User(id=0,uniqueId="", username="", email="", roles="", password=""), date=datetime.now(), requestType="POST", requestPath="/Users")
    secureUser = checkHash(logRequest)
    if user_agent!=None and secureUser!=None:
        if "ADMIN" in secureUser.roles.upper():
            users = selectAllFromUserTable()
        else:
            users [secureUser]
        return users

    return {"response":"Could not authenticate"}

# PATCH update a user 
@app.patch("/User")
def patchUser(user: User, request: Request,user_agent: Annotated[Union[str, None], Header()] = None, busToken: Union[str, None] = Cookie(default=None)):
    logRequest = HashAgent(hash=busToken, userAgent=user_agent, host=request.client.host, port=request.client.port, user=user, date=datetime.now(), requestType="PATCH", requestPath="/User")
    secureUser = checkHash(logRequest)
    if user_agent!=None and secureUser!=None:
        if "ADMIN" in secureUser.roles.upper() or user.id==secureUser.user.id:
            if user.id==secureUser.id:
                # You cannot update your own roles
                user.roles=secureUser.user.roles
            updateUserInTable(user)
            return { "response":"User updated successfully!" }
    return {"response":"Could not authenticate"}

# DELETE delete a user by id
@app.delete("/User/{id}")
def deleteUserById(id:int, request: Request,user_agent: Annotated[Union[str, None], Header()] = None, busToken: Union[str, None] = Cookie(default=None)):
    user = User(id=0, uniqueId="", username="", email="", roles="", password="")
    logRequest = HashAgent(hash=busToken, userAgent=user_agent, host=request.client.host, port=request.client.port, user=user, date=datetime.now(), requestType="POST", requestPath="/User/delete")
    secureUser = checkHash(logRequest)
    if user_agent!=None and secureUser!=None:
        if "ADMIN" in secureUser.roles.upper():
            row = deleteFromUserTableById(id)
            value = "{rownum} User deleted".format(rownum=row)
            return { "response":"User deleted successfully!" }
        elif id==secureUser.id:
            row = deleteFromUserTableById(id)
    return {"response":"Could not authenticate"}

# clear user hash by unique id
@app.post("/User/clearCache")
def clearUserHashByUniqueId(user: User, request: Request,user_agent: Annotated[Union[str, None], Header()] = None, busToken: Union[str, None] = Cookie(default=None)):
    logRequest = HashAgent(hash=busToken, userAgent=user_agent, host=request.client.host, port=request.client.port, user=user, date=datetime.now(), requestType="POST", requestPath="/User/clearCache")
    secureUser = checkHash(logRequest)
    if user_agent!=None and secureUser!=None:
        if "ADMIN" in secureUser.roles.upper() or user.id==secureUser.id:
            clearHash(0, user.uniqueId)
            value = "Hash for user {val} has been cleared".format(val=user.uniqueId)
            return { "response":value }
    return {"response":"Could not authenticate"}



def main():
    return ""


if __name__ == "__main__":
    main()
