class BasicUserService{
    admin=false;
    currentUser=0;
    data = [];
    server = "";
    user = null;
    hash = null;
    skip=true;
    static self = this;
    constructor(data, server, admin=false)
    {
        self=this;
        self.admin=admin;
        self.currentUser=0;
        self.data = data;
        self.server = server;
        if(self.getCookie("hash")&&self.getCookie("user")){
            self.user = JSON.parse(self.getCookie("user"));
            self.hash = self.getCookie("hash");
//            self.cookiePresent();
            self.loadData();
        }
        else
        {
            self.loginUser();
            self.dropdown();
        }

    }
    //Utility functions
    dropdown()
    {
        document.getElementById("user_resultUser").classList.toggle("active");
        var content = document.getElementById("user_userManagement");
        if (content.style.display === "block") {
            content.style.display = "none";
        } else {
            content.style.display = "block";
        }
        
    }
    setCookie(cname, cvalue, exdays) {
        const d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        let expires = "expires="+d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }
      
    getCookie(cname) {
        let name = cname + "=";
        let ca = document.cookie.split(';');
        for(let i = 0; i < ca.length; i++) {
          let c = ca[i];
          while (c.charAt(0) == ' ') {
            c = c.substring(1);
          }
          if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
          }
        }
        return "";
    }
    cookiePresent()
    {
        var input = document.createElement("input");
        input.setAttribute("type", "hidden");
        input.setAttribute("id", "h");
        input.setAttribute("value", self.getCookie("hash"));
        document.getElementById("user_store").appendChild(input);
        input = document.createElement("input");
        input.setAttribute("type", "hidden");
        input.setAttribute("id", "u");
        input.setAttribute("value", self.getCookie("user"));
        document.getElementById("user_store").appendChild(input);
        input = document.createElement("div");
        input.setAttribute("class", "dataDiv");
        input.setAttribute("id", "dataDiv");
        document.getElementById("user_store").appendChild(input);
    }
    //user functions
    changeUser(userNum){
        if(userNum<self.data.length && userNum>=0)
        {
            self.currentUser=userNum;
            self.initialize(self.data[self.currentUser].uniqueId);
        }
    }

    clearCache(userNum){
        var payload = this.data[userNum];
        if(userNum<this.data.length && userNum>=0)
        {
            var delId = this.data[userNum].id;
            var guid = this.data[userNum].uniqueId;
            $.ajax({
                url: this.server+'/User/clearCache'+"/"+self.hash,
                xhrFields: { withCredentials: true },
                type: 'POST',
                data: JSON.stringify(payload),
                // processData: false,
                contentType: 'application/merge-patch+json',
                success: this.clearCache_response
            });
        }

    }
    clearCache_response(result)
    {
        if(result.response == "Could not authenticate"){
            self.signout();
        }else if(result!=null){
            if(result.uniqueId == self.data[self.currentUser].uniqueId)
            {
                self.signout();
            } 
            else{
                self.loadData();
            }
        }
    }
   deleteUser(userNum){
        if(userNum<self.data.length && userNum>=0)
        {
            $.ajax({
                url: self.server+'/User/'+self.data[userNum].id+"/"+self.hash,
                xhrFields: { withCredentials: true },
                type: 'DELETE',
                contentType: 'application/merge-patch+json',
                success: self.deleteUser_response

            });
        }

    }
     deleteUser_response(result)
     {
         if(result.response == "Could not authenticate"){
             self.signout();
         }else if(result!=null){
             self.loadData();
         }
     }
    updateUser(enteredId,enteredUniqueId,enteredUsername,enteredEmail,enteredRoles,enteredPassword){
        var payload={
            id:enteredId,
            uniqueId:enteredUniqueId,
            username:enteredUsername,
            email:enteredEmail,
            password:enteredPassword,
            roles:enteredRoles
        }
        $.ajax({
            url: self.server+'/User'+"/"+self.hash,
            xhrFields: { withCredentials: true },
            type: 'PATCH',
            data: JSON.stringify(payload),
            contentType: 'application/merge-patch+json',
            success: self.updateUser_response
        });
    }
    updateUser_response(result)
    {
        if(result.response == "Could not authenticate"){
            self.signout();
        }else if(result!=null){
            self.loadData();
        }
    }
    insertUser(enteredId,enteredUniqueId,enteredUsername,enteredEmail,enteredPassword1,enteredPassword2){
        if(enteredPassword1!=enteredPassword2)
        {
            var warning = document.createElement("div");
            warning.setAttribute("class", "warning");
            warning.setAttribute("id", "warning");
            warning.appendChild(document.createTextNode("The passwords do not match. Please fix this and resubmit."))
            document.getElementById("user_result").prepend(warning);
        }
        else if(self.user==null){
            var payload={
                username:enteredUsername,
                email:enteredEmail,
                roles:"",
                password:enteredPassword1
            }
            $.ajax({
                url: self.server+'/auth/signup',
                xhrFields: { withCredentials: true },
                type: 'POST',
                data: JSON.stringify(payload),
                // processData: false,
                contentType: 'application/merge-patch+json',
                success: self.cleanup
            });

        }
        else{
            var payload={
                username:enteredUsername,
                email:enteredEmail,
                roles:"",
                password:enteredPassword1
            }
            $.ajax({
                url: self.server+'/auth/signup',
                xhrFields: { withCredentials: true },
                type: 'POST',
                data: JSON.stringify(payload),
                // processData: false,
                contentType: 'application/merge-patch+json',
                success: self.insertUser_response
            });
        }
    }
    insertUser_response(result)
    {
        if(result.response == "Could not authenticate"){
            self.signout();
        }else if(result!=null){
            self.loadData();
        }
    }
    loadData()
    {
        $.ajax({
            url:self.server+'/User'+"/"+self.hash,
            xhrFields: { withCredentials: true },
            type: 'GET',
            contentType: 'application/merge-patch+json',
            success:self.loadData_response
        });
    
    }
    loadData_response(result)
    {
        if(result!=null && result.length==0)
        {
            self.data = [self.user];
        }
        else
        {
            self.data = result;
        }
        self.initialize();
    }

    authenticateUser(enteredUsername,enteredPassword){
        var payload={
            username: enteredUsername,
            password: enteredPassword
        }
        $.ajax({
            url: self.server+'/auth/signin',
            xhrFields: { withCredentials: true },
            type: 'POST',
            data: JSON.stringify(payload),
            contentType: 'application/merge-patch+json',
            success: self.authenticateUser_response
        });
    }
    authenticateUser_response(result)
    {
        if(result.response == "Could not authenticate"){
            self.signout();
        }else if(result!=null){
            self.user=result;
            if(self.getCookie("hash")&&self.getCookie("user")){
            }
            else if (self.user!=null){
                self.hash = self.user.cookie
                self.setCookie("hash", self.user.cookie, 1);
                self.setCookie("user", JSON.stringify(self.user),1);
            }
            self.loadData();
        }
    }
    cleanup(result)
    {
        document.getElementById("user_userListView").innerHTML="";
        document.getElementById("user_result").innerHTML="";
        if(document.getElementById("dataDiv")!=null)
        {
            document.getElementById("dataDiv").innerHTML="";
        }
        document.getElementById("user_store").innerHTML="";
        document.cookie = "hash=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        self.loginUser();
    }
    signout(){
        self.user = null;
        self.hash = null;
        $.ajax({
            url: self.server+'/auth/signout'+"/"+self.hash,
            xhrFields: { withCredentials: true },
            type: 'POST',
            contentType: 'application/merge-patch+json',
            success: self.cleanup
        });
    }

    createUser()
    {

        var header = document.createElement("b");
        header.appendChild(
                document.createTextNode("Editing - A new user")
                );
        document.getElementById("user_resultUser").innerHTML="";    
        document.getElementById("user_resultUser").appendChild(header);    
        
                    
        document.getElementById("user_result").innerHTML="";
        
        var privacy = document.createElement("div");
        privacy.innerHTML="<iframe src=\"./privacy.html\" width=\"640\" height=\"480\"></iframe>"
        document.getElementById("user_result").appendChild(privacy);
        
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

        document.getElementById("user_result").appendChild(container);
    }
    loginUser()
    {
        var header = document.createElement("b");
        header.appendChild(
                document.createTextNode("Login")
                );
        document.getElementById("user_resultUser").innerHTML="";    
        document.getElementById("user_resultUser").appendChild(header);    
        
                    
        document.getElementById("user_result").innerHTML="";
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
        
        input = document.createElement("Button");
        input.setAttribute("id", "userCreateButton");
        input.setAttribute("class", "userListViewEntry");
        input.setAttribute("onclick", "bus.createUser()");
        input.appendChild(document.createTextNode("Create New User"));
        holder.appendChild(input);
        container.appendChild(holder);

        document.getElementById("user_result").appendChild(container);
    }
    editUser(userNum)
    {
        var header = document.createElement("b");
        header.appendChild(
                document.createTextNode("Editing - "+self.data[userNum].uniqueId)
                );
        document.getElementById("user_resultUser").innerHTML="";    
        document.getElementById("user_resultUser").appendChild(header);    
        
                    
        document.getElementById("user_result").innerHTML="";
        
        var container = document.createElement("ul");
        var holder = document.createElement("li");
        holder.setAttribute("class", "userListViewEntry");
        holder.setAttribute("id", "userListViewEntry");
        holder.appendChild(document.createTextNode("Username"));
        var input = document.createElement("input");
        input.setAttribute("id", "username");
        input.setAttribute("value", self.data[userNum].username);
        holder.appendChild(input);
        container.appendChild(holder);
        
        holder = document.createElement("li");
        holder.setAttribute("class", "userListViewEntry");
        holder.setAttribute("id", "userListViewEntry");
        holder.appendChild(document.createTextNode("Email"));
        input = document.createElement("input");
        input.setAttribute("id", "email");
        input.setAttribute("value", self.data[userNum].email);
        holder.appendChild(input);
        container.appendChild(holder);
        
        holder = document.createElement("li");
        holder.setAttribute("class", "userListViewEntry");
        holder.setAttribute("id", "userListViewEntry");
        holder.appendChild(document.createTextNode("Roles"));
        input = document.createElement("input");
        input.setAttribute("id", "roles");
        input.setAttribute("value", self.data[userNum].roles);
        holder.appendChild(input);
        container.appendChild(holder);
        
        holder = document.createElement("li");
        holder.setAttribute("class", "userListViewEntry");
        holder.setAttribute("id", "userListViewEntry");
        holder.appendChild(document.createTextNode("Password"));
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
        self.data[userNum].id+",\""+
        self.data[userNum].uniqueId+"\","+
        "document.getElementById(\"username\").value,"+
        "document.getElementById(\"email\").value,"+
        "document.getElementById(\"roles\").value,"+
        "document.getElementById(\"password\").value"+
        ")");


        holder.appendChild(input);
        container.appendChild(holder);

        document.getElementById("user_result").appendChild(container);
    }

    loadUser()
    {
        var path = window.location.href.replace(window.location.search, "");
        if(self.data.length>0)
        {
            path += "?uniqueId="+self.data[self.currentUser].uniqueId;
            var ahref = document.createElement("a");
            ahref.setAttribute("href",path);
            var header = document.createElement("b");
            header.appendChild(
                    document.createTextNode(self.data[self.currentUser].username)
                    );
            ahref.appendChild(header);
            document.getElementById("user_resultUser").innerHTML="";    
            document.getElementById("user_resultUser").appendChild(ahref);    
            
            document.getElementById("user_result").innerHTML="";

            var holder = document.createElement("div");
            holder.setAttribute("class", "email");
            holder.setAttribute("id", "email");
            holder.appendChild(document.createTextNode("Email: "+self.data[self.currentUser].email));
            document.getElementById("user_result").appendChild(holder);
            
            var holder = document.createElement("div");
            holder.setAttribute("class", "roles");
            holder.setAttribute("id", "roles");
            holder.appendChild(document.createTextNode("Roles: "+self.data[self.currentUser].roles));
            document.getElementById("user_result").appendChild(holder);
            
            holder = document.createElement("div");
            holder.setAttribute("class", "password");
            holder.setAttribute("id", "password");
            holder.appendChild(document.createTextNode("Password: ********************"));
            document.getElementById("user_result").appendChild(holder);
            
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
        var guid = self.getPathVariable("uniqueId");
        if(knownGuid!="")
        {
            guid=knownGuid;
        }
        var unset = true;
        if(document.getElementById("d")!=null)
        {
            self.data = JSON.parse(document.getElementById("d").value);
        }
        for(var i=0;i<self.data.length;i++)
        {
            if(self.data[i].uniqueId===guid)
            {
                self.currentUser=i;
                unset=false;
            }
        }
        if(unset && self.data.length>0)
        {
            self.currentUser=0;
        }
        var collection = document.createElement("ul");
        var item ={};
        document.getElementById("user_userListView").innerHTML="";
        if(self.user!=null)
        {
            var input = document.createElement("button");
            input.setAttribute("id", "userSignout");
            input.setAttribute("class", "userSignoutButton");
            input.setAttribute("onclick", "bus.signout()");
            input.appendChild(document.createTextNode("Sign out"));
            document.getElementById("user_userListView").appendChild(input);
        }
        if(self.user!=null)
        {
            var input = document.createElement("button");
            input.setAttribute("id", "userCreateButton");
            //input.setAttribute("class", "userCreateButton");
            input.setAttribute("onclick", "bus.createUser()");
            input.appendChild(document.createTextNode("Create New User"));
            document.getElementById("user_userListView").appendChild(input);
        }
        for(i=0;i<self.data.length;i++)
        {
            item = document.createElement("li");
            item.setAttribute("class", "userListViewEntry")
            item.setAttribute("id", "userListViewEntry")
            var link=document.createElement("a");
            link.setAttribute("onclick", "bus.changeUser("+i+")");
            link.appendChild(document.createTextNode("Username: "+self.data[i].username));
            item.appendChild(link);

            if(self.admin || (self.user!=null && self.user.id==self.data[i].id))
            {
                var submenu = document.createElement("ul");
                
                var editItem = document.createElement("li");
                editItem.setAttribute("class", "userModify")
                editItem.setAttribute("id", "userModify")
                var editLink=document.createElement("a");
                editLink.setAttribute("onclick", "bus.editUser("+i+")");
                editItem.appendChild(document.createTextNode("Edit"));
                editLink.appendChild(editItem);
                submenu.appendChild(editLink);

                var deleteItem = document.createElement("li");
                deleteItem.setAttribute("class", "userModify")
                deleteItem.setAttribute("id", "userModify")
                var deleteLink=document.createElement("a");
                deleteLink.setAttribute("onclick", "bus.deleteUser("+i+")");
                deleteItem.appendChild(document.createTextNode("Delete"));
                deleteLink.appendChild(deleteItem);
                submenu.appendChild(deleteLink);

                var clearCacheItem = document.createElement("li");
                clearCacheItem.setAttribute("class", "userModify")
                clearCacheItem.setAttribute("id", "userModify")
                var clearCacheLink=document.createElement("a");
                clearCacheLink.setAttribute("onclick", "bus.clearCache("+i+")");
                clearCacheItem.appendChild(document.createTextNode("Clear Hash"));
                clearCacheLink.appendChild(clearCacheItem);
                submenu.appendChild(clearCacheLink);

                item.appendChild(submenu);
            }
            collection.appendChild(item);
        }
        document.getElementById("user_userListView").appendChild(collection);
        self.loadUser();
        if(!self.skip){
            self.dropdown()
            self.skip=true;
        }
    }
}
