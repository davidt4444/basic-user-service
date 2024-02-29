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

from fastapi import FastAPI, Form, Response, Header, Cookie
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
    "http://localhost",
    "https://localhost",
    "http://localhost:8080",
    "https://localhost:8080",
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

class Login(BaseModel):
    username:str
    password:str

class HashAgent(BaseModel):
    hash:str
    userAgent:str
    host:str
    date:datetime
    user:User

class SecureUser(BaseModel):
    hash:str
    user:User

class TransactionUser(BaseModel):
    user:User
    secureUser:SecureUser


agentList = []

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
    return_value = False
    # now = datetime.now()
    # [x for x in agentList if x.date>(now-timedelta(hours=1))]
    # for i in range(0,len(agentList)):
    #     if now-timedelta(hours=1) > agentList[i].date:
    #         agentList.pop(i)
    clearHash(0)
    for i in range(0,len(agentList)):
        if agentList[i].hash==input.hash and agentList[i].userAgent==input.userAgent and agentList[i].host==input.host:
            if agentList[i].user.id!=input.user.id:
                continue
            if agentList[i].user.uniqueId!=input.user.uniqueId:
                continue
            if agentList[i].user.username!=input.user.username:
                continue
            if agentList[i].user.email!=input.user.email:
                continue
            if agentList[i].user.roles!=input.user.roles:
                continue
            if agentList[i].user.password!=input.user.password:
                continue
            agentList[i].date = datetime.now()
            return_value= True
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
            print(r)
        
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
def authenticateUser(loginInput: Login,user_agent: Annotated[Union[str, None], Header()] = None,host: Annotated[Union[str, None], Header()] = None):
    result = selectFromUserTableByLogin(loginInput)
    for r in result:
        user = r
        userHash = hashlib.md5(((user.username.join(random.SystemRandom().choice(string.ascii_uppercase + string.digits) for _ in range(20)))).encode('utf-8')).hexdigest()
        agentList.append(HashAgent(hash=userHash, userAgent=user_agent, host=host, date=datetime.now(), user=user))
        return SecureUser(hash=userHash, user=user)
        # return selectAllFromUserTable()

    return {"response":"Could not authenticate"}

# POST authenticate a user 
@app.post("/auth/signout")
def logout(user:SecureUser):
    for i in range(0, len(agentList)-1):
        if agentList[i].hash == user.hash:
            agentList.pop(i)
    return {"response":"You've been signed out!"}

# POST create a user 
@app.post("/user")
def postUser(transactionUser: TransactionUser,user_agent: Annotated[Union[str, None], Header()] = None,host: Annotated[Union[str, None], Header()] = None):
    # if user_agent!=None and checkHash(HashAgent(hash=transactionUser.secureUser.hash, userAgent=user_agent, host=host, user=transactionUser.secureUser.user, date=datetime.now()))==True:
    #     if "ADMIN" in transactionUser.secureUser.user.roles.upper():
    insertIntoUserTable(transactionUser.user)
    return {"response":"User Saved"}
    # return {"response":"Could not authenticate"}

# POST read all users 
@app.post("/users")
def getUsers(secureUser:SecureUser,user_agent: Annotated[Union[str, None], Header()] = None,host: Annotated[Union[str, None], Header()] = None):
    if user_agent!=None and checkHash(HashAgent(hash=secureUser.hash, userAgent=user_agent, host=host, user=secureUser.user, date=datetime.now()))==True:
        if "ADMIN" in secureUser.user.roles.upper():
            result = selectAllFromUserTable()
            return result
        else:
            return [secureUser.user]
    return {"response":"Could not authenticate"}

# PATCH update a user 
@app.patch("/user")
def patchUser(transactionUser: TransactionUser,user_agent: Annotated[Union[str, None], Header()] = None,host: Annotated[Union[str, None], Header()] = None):
    if user_agent!=None and checkHash(HashAgent(hash=transactionUser.secureUser.hash, userAgent=user_agent, host=host, user=transactionUser.secureUser.user, date=datetime.now()))==True:
        if "ADMIN" in transactionUser.secureUser.user.roles.upper() or transactionUser.user.id==transactionUser.secureUser.user.id:
            if transactionUser.user.id==transactionUser.secureUser.user.id:
                # You cannot update your own roles
                transactionUser.user.roles=transactionUser.secureUser.user.roles
            updateUserInTable(transactionUser.user)
            return {"response":"User Updated"}
    return {"response":"Could not authenticate"}

# DELETE delete a user by id
@app.post("/user/delete/{id}")
def deleteUserById(id: int,secureUser:SecureUser,user_agent: Annotated[Union[str, None], Header()] = None,host: Annotated[Union[str, None], Header()] = None):
    if user_agent!=None and checkHash(HashAgent(hash=secureUser.hash, userAgent=user_agent, host=host, user=secureUser.user, date=datetime.now()))==True:
        if "ADMIN" in secureUser.user.roles.upper():
            row = deleteFromUserTableById(id)
            value = "{rownum} User deleted".format(rownum=row)
            return {"response":value}
    return {"response":"Could not authenticate"}

# clear user hash by unique id
@app.post("/user/clearCache/{uniqueId}")
def clearUserHashByUniqueId(uniqueId: str,secureUser:SecureUser,user_agent: Annotated[Union[str, None], Header()] = None,host: Annotated[Union[str, None], Header()] = None):
    if user_agent!=None and checkHash(HashAgent(hash=secureUser.hash, userAgent=user_agent, host=host, user=secureUser.user, date=datetime.now()))==True:
        if "ADMIN" in secureUser.user.roles.upper():
            clearHash(0, uniqueId)
            value = "Hash for user {val} has been cleared".format(val=uniqueId)
            return {"response":value}
    return {"response":"Could not authenticate"}



def main():
    print(hashlib.md5("stuff".encode('utf-8')).hexdigest())
    print(hashlib.md5("stuff").hexdigest())
    #test()
    return ""


if __name__ == "__main__":
    main()
