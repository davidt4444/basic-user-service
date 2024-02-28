class BasicUserService{
    admin=false;
    currentUser=0;
    data = [];
    server = "";
    constructor(data, server, admin=false)
    {
        this.admin=admin;
        this.currentUser=0;
        this.data = data;
        this.server = server;
        document.getElementById("resultXml").style.display="none";
        this.initialize();

    }

    showHideXml(){
        var x = document.getElementById("resultXml");
        if (x.style.display === "none") {
          x.style.display = "block";
        } else {
          x.style.display = "none";
        }
    }
    changeUser(userNum){
        if(userNum<this.data.length && userNum>=0)
        {
            this.currentUser=userNum;
            this.initialize(this.data[this.currentUser].uniqueId);
        }
        //this will change thee path to the user without reload
        //To keep it in the same page
        // this.loadUser();
        //The alternative is this. It will allow the browser back button to work. 
        
        // var path = window.location.href.replace(window.location.search, "")+"?uniqueId="+this.data[this.currentUser].uniqueId;
        // window.location.href=path;
    }

    deleteUser(userNum){
        var payload = {
            "hash": document.getElementById("h").value,
            "user": JSON.parse(document.getElementById("u").value)
        }
        if(userNum<this.data.length && userNum>=0)
        {
            var delId = this.data[userNum].id;
            var guid = this.data[userNum].uniqueId;
            $.ajax({
                url: this.server+'/user/delete/'+delId,
                type: 'POST',
                data: JSON.stringify(payload),
                contentType: 'application/merge-patch+json',
                    success: function(result) {
                    if(result.response == "Could not authenticate"){
                        var input = document.createElement("button");
                        input.setAttribute("id", "authFailed");
                        input.setAttribute("class", "userButton");
                        input.setAttribute("onclick", "bus.signout()");
                        input.appendChild(document.createTextNode("Auth Failed! Signing out..."));
                        document.getElementById("result").appendChild(input);
                        document.getElementById("authFailed").click();
                    }else{
                        var input = document.createElement("button");
                        input.setAttribute("id", "loadData");
                        input.setAttribute("class", "userButton");
                        input.setAttribute("onclick", "bus.loadData()");
                        input.appendChild(document.createTextNode("Loading Data..."));
                        document.getElementById("result").appendChild(input);
                        document.getElementById("loadData").click();
                    }

                    // var path = window.location.href.replace(window.location.search, "")+"?result="+guid+" deleted";
                    // window.location.href=path;
                }
            });
        }

    }
    updateUser(enteredId,enteredUniqueId,enteredUsername,enteredEmail,enteredRoles,enteredPassword){
        var payload={
            "user":{
                id: enteredId,
                uniqueId: enteredUniqueId,
                username: enteredUsername,
                email: enteredEmail,
                roles: enteredRoles,
                password: enteredPassword
            },
            secureUser:{
                "hash": document.getElementById("h").value,
                "user": JSON.parse(document.getElementById("u").value)
            }
        }
        $.ajax({
            url: this.server+'/user/',
            type: 'PATCH',
            data: JSON.stringify(payload),
            // processData: false,
            contentType: 'application/merge-patch+json',
            success: function(result) {

                if(result.response == "Could not authenticate"){
                    var input = document.createElement("button");
                    input.setAttribute("id", "authFailed");
                    input.setAttribute("class", "userButton");
                    input.setAttribute("onclick", "bus.signout()");
                    input.appendChild(document.createTextNode("Auth Failed! Signing out..."));
                    document.getElementById("result").appendChild(input);
                    document.getElementById("authFailed").click();
                }else{
                    var input = document.createElement("button");
                    input.setAttribute("id", "loadData");
                    input.setAttribute("class", "userButton");
                    input.setAttribute("onclick", "bus.loadData()");
                    input.appendChild(document.createTextNode("Loading Data..."));
                    document.getElementById("result").appendChild(input);
                    document.getElementById("loadData").click();
                }
        }
        });
    }
    insertUser(enteredId,enteredUniqueId,enteredUsername,enteredEmail,enteredPassword1,enteredPassword2){
        if(enteredPassword1!=enteredPassword2)
        {
            var warning = document.createElement("div");
            warning.setAttribute("class", "warning");
            warning.setAttribute("id", "warning");
            warning.appendChild(document.createTextNode("The passwords do not match. Please fix this and resubmit."))
            document.getElementById("result").prepend(warning);
        }else{
            var payload={
                "user":{
                    id: enteredId,
                    uniqueId: enteredUniqueId,
                    username: enteredUsername,
                    email: enteredEmail,
                    roles: "",
                    password: enteredPassword1
                },
                secureUser:{
                    "hash": document.getElementById("h").value,
                    "user": JSON.parse(document.getElementById("u").value)
                }
            }
            $.ajax({
                url: this.server+'/user/',
                type: 'POST',
                data: JSON.stringify(payload),
                // processData: false,
                contentType: 'application/merge-patch+json',
                success: function(result) {
                    
                    if(result.response == "Could not authenticate"){
                        var input = document.createElement("button");
                        input.setAttribute("id", "authFailed");
                        input.setAttribute("class", "userButton");
                        input.setAttribute("onclick", "bus.signout()");
                        input.appendChild(document.createTextNode("Auth Failed! Signing out..."));
                        document.getElementById("result").appendChild(input);
                        document.getElementById("authFailed").click();
                    }else{
                        var input = document.createElement("button");
                        input.setAttribute("id", "loadData");
                        input.setAttribute("class", "userButton");
                        input.setAttribute("onclick", "bus.loadData()");
                        input.appendChild(document.createTextNode("Loading Data..."));
                        document.getElementById("result").appendChild(input);
                        document.getElementById("loadData").click();
                    }
                    // var path = window.location.href.replace(window.location.search, "")+"?result=created";
                    // window.location.href=path;
                }
            });
        }
    }
    loadData()
    {
        var payload = {
            "hash": document.getElementById("h").value,
            "user": JSON.parse(document.getElementById("u").value)
        }
        $.ajax({
            url:this.server+'/users', 
            type: 'POST',
            data: JSON.stringify(payload),
            contentType: 'application/merge-patch+json',
            success:function(result) {
                document.getElementById("result").innerHtml="";
                if(result.response == "Could not authenticate"){
                    var input = document.createElement("button");
                    input.setAttribute("id", "authFailed");
                    input.setAttribute("class", "userButton");
                    input.setAttribute("onclick", "bus.signout()");
                    input.appendChild(document.createTextNode("Auth Failed! Signing out..."));
                    document.getElementById("result").appendChild(input);
                    document.getElementById("authFailed").click();
                }
    
                var input = document.createElement("button");
                input.setAttribute("id", "initializeData");
                input.setAttribute("class", "userButton");
                input.setAttribute("onclick", "bus.initialize()");
                input.appendChild(document.createTextNode("Initialize Data..."));
                document.getElementById("result").appendChild(input);
                
                document.getElementById("dataDiv").innerHTML="";
                input = document.createElement("input");
                input.setAttribute("type", "hidden");
                input.setAttribute("id", "d");
                input.setAttribute("value", JSON.stringify(result));
                document.getElementById("dataDiv").appendChild(input);

                document.getElementById("initializeData").click()
        
            }
        });
    
    }
    authenticateUser(enteredUsername,enteredPassword){
        var payload={
            username: enteredUsername,
            password: enteredPassword
        }
        $.ajax({
            url: this.server+'/auth/signin',
            type: 'POST',
            data: JSON.stringify(payload),
            // processData: false,
            contentType: 'application/merge-patch+json',
            success: function(result) {
                if(result.response=="Could not authenticate")
                {
                    var warning = document.createElement("div");
                    warning.setAttribute("class", "warning");
                    warning.setAttribute("id", "warning");
                    warning.appendChild(document.createTextNode("The username or password do not match our records."))
                    document.getElementById("result").prepend(warning);
                }else
                {
                    var good = document.createElement("div");
                    good.setAttribute("class", "good");
                    good.setAttribute("id", "good");
                    good.appendChild(document.createTextNode("Success!"))
                    document.getElementById("result").innerHTML=""
                    document.getElementById("result").append(good);

                    var input = document.createElement("button");
                    input.setAttribute("id", "loadData");
                    input.setAttribute("class", "userButton");
                    input.setAttribute("onclick", "bus.loadData()");
                    input.appendChild(document.createTextNode("Loading Data..."));
                    document.getElementById("result").appendChild(input);

                    input = document.createElement("input");
                    input.setAttribute("type", "hidden");
                    input.setAttribute("id", "h");
                    input.setAttribute("value", result.hash);
                    document.getElementById("store").appendChild(input);
                    input = document.createElement("input");
                    input.setAttribute("type", "hidden");
                    input.setAttribute("id", "u");
                    input.setAttribute("value", JSON.stringify(result.user));
                    document.getElementById("store").appendChild(input);
                    input = document.createElement("div");
                    input.setAttribute("class", "dataDiv");
                    input.setAttribute("id", "dataDiv");
                    document.getElementById("store").appendChild(input);
                    document.getElementById("loadData").click()
    
                }
            }
        });
    }

    signout(){
        var payload = {
            "hash": document.getElementById("h").value,
            "user": JSON.parse(document.getElementById("u").value)
        }
        $.ajax({
            url: this.server+'/auth/signout',
            type: 'POST',
            data: JSON.stringify(payload),
            // processData: false,
            contentType: 'application/merge-patch+json',
            success: function(result) {
                document.getElementById("store").innerHTML="";
                var path = window.location.href.replace(window.location.search, "")+"?result=Logged in";
                window.location.href=path;
            }
        });
    }

    createUser()
    {
        var header = document.createElement("h2");
        header.appendChild(
                document.createTextNode("Editing - A new user")
                );
        document.getElementById("result_title").innerHTML="";    
        document.getElementById("result_title").appendChild(header);    
        
                    
        document.getElementById("result").innerHTML="";
        var container = document.createElement("ul");
        var holder = document.createElement("li");
        holder.setAttribute("class", "userListViewEntry");
        holder.setAttribute("id", "userListViewEntry");
        holder.appendChild(document.createTextNode("Username"));
        var input = document.createElement("input");
        input.setAttribute("id", "username");
        holder.appendChild(input);
        container.appendChild(holder);
        
        holder = document.createElement("li");
        holder.setAttribute("class", "userListViewEntry");
        holder.setAttribute("id", "userListViewEntry");
        holder.appendChild(document.createTextNode("Email"));
        input = document.createElement("input");
        input.setAttribute("id", "email");
        input.setAttribute("type", "email");
        holder.appendChild(input);
        container.appendChild(holder);
        
        holder = document.createElement("li");
        holder.setAttribute("class", "userListViewEntry");
        holder.setAttribute("id", "userListViewEntry");
        holder.appendChild(document.createTextNode("Password Entry #1"));
        input = document.createElement("input");
        input.setAttribute("id", "password1");
        input.setAttribute("type", "password");
        holder.appendChild(input);
        container.appendChild(holder);
        
        holder = document.createElement("li");
        holder.setAttribute("class", "userListViewEntry");
        holder.setAttribute("id", "userListViewEntry");
        holder.appendChild(document.createTextNode("Password Entry #2"));
        input = document.createElement("input");
        input.setAttribute("id", "password2");
        input.setAttribute("type", "password");
        holder.appendChild(input);
        container.appendChild(holder);
        
        holder = document.createElement("li");
        holder.setAttribute("class", "userListViewEntry");
        holder.setAttribute("id", "userListViewEntry");
        input = document.createElement("Button");
        input.appendChild(document.createTextNode("Submit"))
        input.setAttribute("onclick", "bus.insertUser(0,\"\","+
        "document.getElementById(\"username\").value,"+
        "document.getElementById(\"email\").value,"+
        "document.getElementById(\"password1\").value,"+
        "document.getElementById(\"password2\").value"+
        ")");
        holder.appendChild(input);
        container.appendChild(holder);

        document.getElementById("result").appendChild(container);
    }
    loginUser()
    {
        var header = document.createElement("h2");
        header.appendChild(
                document.createTextNode("Login")
                );
        document.getElementById("result_title").innerHTML="";    
        document.getElementById("result_title").appendChild(header);    
        
                    
        document.getElementById("result").innerHTML="";
        var container = document.createElement("ul");
        var holder = document.createElement("li");
        holder.setAttribute("class", "userListViewEntry");
        holder.setAttribute("id", "userListViewEntry");
        holder.appendChild(document.createTextNode("Username"));
        var input = document.createElement("input");
        input.setAttribute("id", "username");
        holder.appendChild(input);
        container.appendChild(holder);
        
        holder = document.createElement("li");  
        holder.setAttribute("class", "userListViewEntry");
        holder.setAttribute("id", "userListViewEntry");
        holder.appendChild(document.createTextNode("Password"));
        input = document.createElement("input");
        input.setAttribute("id", "password");
        input.setAttribute("type", "password");
        holder.appendChild(input);
        container.appendChild(holder);
        
        holder = document.createElement("li");
        holder.setAttribute("class", "userListViewEntry");
        holder.setAttribute("id", "userListViewEntry");
        input = document.createElement("Button");
        input.appendChild(document.createTextNode("Submit"))
        input.setAttribute("onclick", "bus.authenticateUser("+
        "document.getElementById(\"username\").value,"+
        "document.getElementById(\"password\").value,"+
        ")");
        
        holder.appendChild(input);
        container.appendChild(holder);

        document.getElementById("result").appendChild(container);
    }
    editUser(userNum)
    {
        var header = document.createElement("h2");
        header.appendChild(
                document.createTextNode("Editing - "+this.data[userNum].uniqueId)
                );
        document.getElementById("result_title").innerHTML="";    
        document.getElementById("result_title").appendChild(header);    
        
                    
        document.getElementById("result").innerHTML="";
        var container = document.createElement("ul");
        var holder = document.createElement("li");
        holder.setAttribute("class", "userListViewEntry");
        holder.setAttribute("id", "userListViewEntry");
        holder.appendChild(document.createTextNode("Title"));
        var input = document.createElement("input");
        input.setAttribute("id", "username");
        input.setAttribute("value", this.data[userNum].username);
        holder.appendChild(input);
        container.appendChild(holder);
        
        holder = document.createElement("li");
        holder.setAttribute("class", "userListViewEntry");
        holder.setAttribute("id", "userListViewEntry");
        holder.appendChild(document.createTextNode("Email"));
        input = document.createElement("input");
        input.setAttribute("id", "email");
        input.setAttribute("value", this.data[userNum].email);
        holder.appendChild(input);
        container.appendChild(holder);
        
        holder = document.createElement("li");
        holder.setAttribute("class", "userListViewEntry");
        holder.setAttribute("id", "userListViewEntry");
        holder.appendChild(document.createTextNode("Roles"));
        input = document.createElement("input");
        input.setAttribute("id", "roles");
        input.setAttribute("value", this.data[userNum].roles);
        holder.appendChild(input);
        container.appendChild(holder);
        
        holder = document.createElement("li");
        holder.setAttribute("class", "userListViewEntry");
        holder.setAttribute("id", "userListViewEntry");
        holder.appendChild(document.createTextNode("Password #1"));
        input = document.createElement("input");
        input.setAttribute("id", "password");
        input.setAttribute("type", "password");
        input.setAttribute("value", "");
        holder.appendChild(input);
        container.appendChild(holder);
        
        holder = document.createElement("li");
        holder.setAttribute("class", "userListViewEntry");
        holder.setAttribute("id", "userListViewEntry");
        input = document.createElement("Button");
        input.appendChild(document.createTextNode("Submit"))
        input.setAttribute("onclick", "bus.updateUser("+
        this.data[userNum].id+",\""+
        this.data[userNum].uniqueId+"\","+
        "document.getElementById(\"username\").value,"+
        "document.getElementById(\"email\").value,"+
        "document.getElementById(\"roles\").value,"+
        "document.getElementById(\"password\").value"+
        ")");


        holder.appendChild(input);
        container.appendChild(holder);

        document.getElementById("result").appendChild(container);
    }

    loadUser()
    {
        var path = window.location.href.replace(window.location.search, "");
        if(this.data.length>0)
        {
            path += "?uniqueId="+this.data[this.currentUser].uniqueId;
            //this will change thee path to the post without reload
            // window.history.pushState("", window.title, path);
            var ahref = document.createElement("a");
            ahref.setAttribute("href",path);
            var header = document.createElement("h2");
            header.appendChild(
                    document.createTextNode(this.data[this.currentUser].username)
                    );
            ahref.appendChild(header);
            document.getElementById("result_title").innerHTML="";    
            document.getElementById("result_title").appendChild(ahref);    
            
            document.getElementById("result").innerHTML="";
            document.getElementById("resultXml").innerHTML="";

            var holder = document.createElement("div");
            holder.setAttribute("class", "email");
            holder.setAttribute("id", "email");
            holder.appendChild(document.createTextNode("Email: "+this.data[this.currentUser].email));
            document.getElementById("result").appendChild(holder);
            
            var holder = document.createElement("div");
            holder.setAttribute("class", "roles");
            holder.setAttribute("id", "roles");
            holder.appendChild(document.createTextNode("Roles: "+this.data[this.currentUser].roles));
            document.getElementById("result").appendChild(holder);
            
            holder = document.createElement("div");
            holder.setAttribute("class", "password");
            holder.setAttribute("id", "password");
            holder.appendChild(document.createTextNode("Password: ********************"));
            document.getElementById("result").appendChild(holder);
            
        }
    }
    getPathVariable(find)
    {
        var queryString=window.location.search;
        queryString=queryString.replace("?", "");
        var keyValue = queryString.split("&");
        for(var i=0; i<keyValue.length;i++)
        {
            var pair = keyValue[i].split("=");
            if(pair[0]===find)
            {
                return pair[1];
            }
        }
    }
    initialize(knownGuid="")
    {
        var guid = this.getPathVariable("uniqueId");
        if(knownGuid!="")
        {
            guid=knownGuid;
        }
        var unset = true;
        if(document.getElementById("d")!=null)
        {
            this.data = JSON.parse(document.getElementById("d").value);
        }
        for(var i=0;i<this.data.length;i++)
        {
            if(this.data[i].uniqueId===guid)
            {
                this.currentUser=i;
                unset=false;
            }
        }
        if(unset && this.data.length>0)
        {
            this.currentUser=0;
        }
        var collection = document.createElement("ul");
        var item ={};
        document.getElementById("userListView").innerHTML="";
        if(this.admin && document.getElementById("u")!=null)
        {
            // document.getElementById("result").innerHtml="";
            var input = document.createElement("button");
            input.setAttribute("id", "userSignout");
            input.setAttribute("class", "userButton");
            input.setAttribute("onclick", "bus.signout()");
            input.appendChild(document.createTextNode("Sign out"));
            document.getElementById("userListView").appendChild(input);
            input = document.createElement("button");
            input.setAttribute("id", "userCreateButton");
            input.setAttribute("class", "userButton");
            input.setAttribute("onclick", "bus.createUser()");
            input.appendChild(document.createTextNode("Create New User"));
            document.getElementById("userListView").appendChild(input);
        }
        for(i=0;i<this.data.length;i++)
        {
            item = document.createElement("li");
            item.setAttribute("class", "userListViewEntry")
            item.setAttribute("id", "userListViewEntry")
            var link=document.createElement("a");
            link.setAttribute("onclick", "bus.changeUser("+i+")");
            link.appendChild(document.createTextNode("Username: "+this.data[i].username));
            item.appendChild(link);

            if(this.admin)
            {
                var submenu = document.createElement("ul");
                
                var editItem = document.createElement("li");
                editItem.setAttribute("class", "userModify")
                editItem.setAttribute("id", "userModify")
                var editLink=document.createElement("a");
                editLink.setAttribute("onclick", "bus.editUser("+i+")");
                editLink.appendChild(document.createTextNode("Edit"));
                editItem.appendChild(editLink);
                submenu.appendChild(editItem);

                var deleteItem = document.createElement("li");
                deleteItem.setAttribute("class", "userModify")
                deleteItem.setAttribute("id", "userModify")
                var deleteLink=document.createElement("a");
                deleteLink.setAttribute("onclick", "bus.deleteUser("+i+")");
                deleteLink.appendChild(document.createTextNode("Delete"));
                deleteItem.appendChild(deleteLink);
                submenu.appendChild(deleteItem);
                
                item.appendChild(submenu);
            }
            collection.appendChild(item);
        }
        document.getElementById("userListView").appendChild(collection);
        this.loadUser();
        // JSON result in `data` variable

    }
}
