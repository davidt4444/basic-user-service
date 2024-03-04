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
delete from User where id=2;

select id, uniqueId, username, email, roles, password from User;
select id, uniqueId, username, email, roles, password from User where username="test" and password=md5("test");

SELECT MD5('testing');



