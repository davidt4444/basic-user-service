/*
 This is just a scratch list of test queries on the database 
*/
use pythonbase;
use javabase;
/*
User Auth queries
*/
CREATE TABLE User ( 
    id BIGINT key NOT NULL AUTO_INCREMENT,
    uniqueId CHAR(36) NOT NULL DEFAULT (UUID()),
    username VARCHAR(20), 
    email VARCHAR(50), 
    roles VARCHAR(255), 
    password varchar(32)
    );
drop table User;
truncate table User;

insert into User(     
    username, 
    email, 
    roles, 
    password
    )
values( "root",
        "david@davidthigpen.com",
        "ADMIN",
        md5("password")
    );
update User set email="david@davidthigpen.com"
    where username="test" and password=md5("test")
;
update User set password=md5("test")
    where id=1
;

select id, uniqueId, username, email, roles, password from User;
select id, uniqueId, username, email, roles, password from User where username="test" and password=md5("test");

SELECT MD5('testing');


/*
Here is an example of using a filter view to influence the post order
*/

create table PostDisplay ( 
    id int NOT NULL AUTO_INCREMENT,
    uniqueId CHAR(36),
    PRIMARY KEY (id)
);
drop table PostDisplay;
truncate table PostDisplay;
insert into PostDisplay( uniqueId) values( "cc309516-cf5b-11ee-8573-f3e6a68ccc5c");
insert into PostDisplay( uniqueId) values( "cac71146-cf5b-11ee-8573-f3e6a68ccc5c");
insert into PostDisplay( uniqueId) values( "ccbf8938-cf5b-11ee-8573-f3e6a68ccc5c");
SELECT * FROM PostDisplay;
SELECT p.id, p.uniqueId, p.title, p.author, p.date, p.content FROM PostDisplay pd, Post p where pd.uniqueId=p.uniqueId;

/*
I pulled the test guids from a select query off of the main Post table
*/

SELECT id, uniqueId, title, author, date, content FROM Post;

cc309516-cf5b-11ee-8573-f3e6a68ccc5c
cac71146-cf5b-11ee-8573-f3e6a68ccc5c
ccbf8938-cf5b-11ee-8573-f3e6a68ccc5c




