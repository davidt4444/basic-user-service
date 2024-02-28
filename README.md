# basic-user-service
<p>
This is a basic python web service using FastApi 
</p>
<p>
To setup the environment locally, run the following commands on your ec2.
</p>
<p>
sudo dnf install git<br />
sudo dnf install python3 python3-pip<br />
pip install fastapi<br />
pip install "uvicorn[standard]"<br />
pip install requests<br />
pip install python-multipart<br />
pip install mysql-connector-python<br />
pip install timedelta<br />
git clone https://github.com/davidt4444/basic-user-service.git<br />
</p>
<p>
If you don't have a database setup, then run the following to setup a mariadb on an aws ec2.
</p>
<p>
https://linux.how2shout.com/installing-mariadb-on-amazon-linux-2023/
</p>
<p>
sudo dnf update<br />
sudo dnf install mariadb105-server<br />
sudo systemctl start mariadb<br />
<b>keep up on restart</b><br />
sudo systemctl enable mariadb<br />
<b>Check status </b><br />
sudo systemctl status mariadb<br />
<b>harden security<b><br />
sudo mysql_secure_installation<br />
<b>login using</b> <br />
mysql -u root -p<br />
<b>create a python base database</b><br />
create database pythonbase;<br />
<b>switch to the database</b>
use pythonbase;<br />
</p>
<p>
<b>create the table to store the Users</b><br />
CREATE TABLE User ( <br />
    id BIGINT key NOT NULL AUTO_INCREMENT,<br />
    uniqueId CHAR(36) NOT NULL DEFAULT (UUID()),<br />
    username VARCHAR(20), <br />
    email VARCHAR(50), <br />
    roles VARCHAR(255), <br />
    password varchar(32)<br />
    );<br />
</p>
<p>
To finish your database setup, just fill out the connection details for the username and password in the example.cnf file for your database that you created in the previous steps. 
</p>
<p>
If you have a sql development application that you like to use to connect to your database for other reporting, you might want to setup a port tunnel for the database using the instructions below.
</p>
<p>
https://help.krystal.uk/cpanel-advanced-topics/how-to-connect-to-a-my-sql-database-using-an-ssh-tunnel#:~:text=An%20SSH%20connection%20can%20also,the%20standard%20port%20for%20MySQL).
</p>
<p>
<b>It suggests</b><br />
ssh -p 722 -N -L 3333:localhost:3306 username@server<br />
<b>use instead, because you are going to need to run some stuff on the terminal to the server</b><br />
ssh -L 3333:localhost:3306 -i "./pemfile.pem" username@server<br />
<b> where 3333 is the port you connect to the remote instance of your database as localhost</b><br />
</p>
<p>
<b>ssh</b><br />
ssh -i "./pemfile.pem" username@server<br />
</p>
<p>
After you have done all of the stuff above, you can run the following command to get the service up and running on port 8000
</p>
<p>
python3 -m uvicorn authenticationService:app --reload
</p>
<p>
For the front end, BasicUserService.js is the code for the front end and the view.html file is an example of how to build out the view on your website. Right now it displays the user, the users details and a list of users that it has access to. This is all from the default behavior in the initialize function. You can change this by having it call a different function when you instantiate the object with admin set to false. Basically, the hash and the logged in user are set in the hidden inputs for passing in them to get stuff that you need to be authenticated to see though.
</p>
<p>
You will obviously want to put a skin on it and move the contents of that file inside the element that you will use to hold the site. You will also need to move over the style elements to the local styles.css file for your website.
</p>
<p>
For the back end, I use the adminView.html on my local laptop with the mysql instance port forwarded into the laptop with basic-user-service running on my laptop.
</p>
<p>
For the production outward facing service on an ec2, you will want to modify the origins in the python code for security with only the address of your front end in the origins array. For more information on that go to https://fastapi.tiangolo.com/tutorial/cors/.
</p>
<p>
Also, for production, there are some things that should be changed in add_middleware in the python code. 
</p>
<p>
Since this uses bearer tokens, you will not need cookies, so set allow_credentials=false. You are going to want to change allow methods to allow_methods=["POST", "PATCH"] for authentication, token issuance and user updates.  
</p>
<p>
You also should be able to comment out allow_headers for default behavior. Accept, Accept-Language, Content-Language and Content-Type should still be allowed in that case.
</p>
<p>-----------Work in progress-----------------</p>
<p>
production.py is an example of what is running in production. The example command below allows you to set a different port than 8000. Just change the $PORT variable to the desired port.
</p>
<p>
python3 -m uvicorn production:app --reload --port $PORT --host 0.0.0.0
</p>
<p>
To run this off of a browser from a file served on an https website you are going to need to run this in ssl.
</p>
<p>
python3 -m uvicorn production:app --reload --port $PORT --ssl-keyfile=./localhost+3-key.pem --ssl-certfile=./localhost+3.pem --host 0.0.0.0
</p>
<p>
For test environments running on desktops you can generate locally signed certs (look in aws-resources). These will not work on mobile devices (There will be a section explaining this on the www.thenameofyourbrand.com).
</p>
<p>
mkcert localhost 127.0.0.1 ::1 $SERVICEDOMAIN $SERVICEIPADDRESS
</p>
<p>
You can verify this by following the following steps for debugging on android phones or just watch it not work on your own phone.
</p>
<p>
https://www.boxuk.com/insight/remote-debugging-websites-on-mobile-devices/<br />
settings->system->developer options->usb debugging<br />
</p>
<p>
So, to generate the public ca certs you need to run on mobile devices,
Make sure to open port 80 (HTTP) and 443 (HTTPS) in inbound rules for your ec2
</p>
<p>
On the ec2 run <br />
sudo yum install certbot<br />
sudo certbot certonly --standalone<br />
<b> output</b><br />
Successfully received certificate.<br />
Certificate is saved at: /etc/letsencrypt/live/bcs.thenameofyourbrand.com/fullchain.pem<br />
Key is saved at:         /etc/letsencrypt/live/bcs.thenameofyourbrand.com/privkey.pem<br />
This certificate expires on 2024-05-21.<br />
These files will be updated when the certificate renews.<br />
Certbot has set up a scheduled task to automatically renew this certificate in the background.<br />
</p>
<p>
It will update the cert at Those locations, so you will need to repeat the following step every 3 months. I do this because you don't own the file produced by the program, and I don't like running the service as root
</p>
<p>
sudo cp /etc/letsencrypt/live/bcs.thenameofyourbrand.com/fullchain.pem ./<br />
sudo cp /etc/letsencrypt/live/bcs.thenameofyourbrand.com/privkey.pem ./<br />
sudo chown ec2-user fullchain.pem<br />
sudo chown ec2-user privkey.pem<br />
</p>
<p>
python3 -m uvicorn production:app --reload --port 8080 --ssl-keyfile=./privkey.pem --ssl-certfile=./fullchain.pem --host 0.0.0.0
</p>
<p>
You can test them at  
https://www.ssllabs.com/ssltest/analyze.html
</p>
<p>
To run it in the background run:
</p>
<p>
screen -d -m -s "basic-user-service" python3 -m uvicorn production:app --port 8080 --ssl-keyfile=./privkey.pem --ssl-certfile=./fullchain.pem --host 0.0.0.0 --log-config ./log.ini
</p>
<p>
To reattach and manage the screen run:<br />
screen -R<br />
</p>
<p>
Docs:
https://stackoverflow.com/questions/8164664/running-a-command-as-a-background-process-service
</p>
<p>
For logging 
https://stackoverflow.com/questions/60715275/fastapi-logging-to-file
https://gist.github.com/liviaerxin/d320e33cbcddcc5df76dd92948e5be3b
</p>
<p>
This did not behave well for me, but to setup relaunch on reboot<br />
https://repost.aws/knowledge-center/ec2-windows-run-command-new<br />
-><br />
https://docs.aws.amazon.com/AWSEC2/latest/WindowsGuide/ec2-windows-user-data.html#user-data-scripts<br />
<br />
Actions->Instance Settings->edit User Data<br />
Stop the instance first to Add this<br />
</p>
<xmp>
<script>
screen -d -m -s "basic-user-service" python3 -m uvicorn production:app --reload --port 8080 --ssl-keyfile=./localhost+5-key.pem --ssl-certfile=./localhost+5.pem --host 0.0.0.0
</script>
</xmp>
<p>
Depending on how into analytics about your viewers, you can get the ip location info from the link below and join it against data in you logs for some early insights into your viewers.It is like caller id for your phone.
</p>
<p>
<a href='https://db-ip.com'>IP Geolocation by DB-IP</a><br />
https://db-ip.com/db/download/ip-to-city-lite<br />
</p>
<p>For individual ip addresses, I use https://ipinfo.io/$IP where I put the ip address where the $IP variable is.</>