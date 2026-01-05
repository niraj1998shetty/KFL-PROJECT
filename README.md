# KFL-PROJECT
katthegangfantasyleaugue.com


install node (v20.18.3)  
install npm (10.9.0)  
install git (git version 2.48.1.windows.1)  
create on folder in local and initialize git there  
clone the repo into your local

------------------------------------------------------------------------------------------------------------------------------------------------------------
#FRONT-END   
.env:
create a folder called .env at root of react (kfl-client)  
and copy paste this,
VITE_API_URL=

-----------------------

In terminal:
cd ./kfl-client  
run--> npm ci  
to run the app do --> npm run dev  
Optional-- if error occurs regarding package installation see package.json file (dependecies) and do individual installation( i.e --> npm i react react-router-dom lucide-react axios etc) 

---------------------------------------------------------------------------------------------------------------------------------------------------------
---------------------------------------------------------------------------------------------------------------------------------------------------------

#BACKEND
if already installed node,npm,git then no need to reinstall, proceed
or else install those libraries

----------
.env :
create a folder called .env at root of backend (kfl-server)  
and Copy paste this  
NODE_ENV=development  
PORT=5000  
MONGO_URI=mongodb+srv://niraj:niraj%40123@cluster0.o8zem.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0  
JWT_SECRET=kfl_supersecret_key_change_this_in_production  
JWT_EXPIRE=300d

---------------
In terminal:
cd ./kfl-server  
run--> npm ci  
to run the app do --> npm run start  
Optional-- if error occurs regarding package installation see package.json file (dependecies) and do individual installation( i.e --> npm i express mongoose cors jsonwebtoken etc) 
I found one issue- better we should do--> npm i react react-router-dom lucide-react axios

----------------------------------------------------------------------------------------------------------------------------------------------------------  
