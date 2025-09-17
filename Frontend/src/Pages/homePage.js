import {useEffect, useState} from "react";
import Login from "../Components/authentication/Login";
import Signup from "../Components/authentication/Signup";
import './Homepage.css'
import orangebackground from '../assest/orangebackground.jpg'
import homepageLogo from '../assest/homepageLogo.svg'
import { useHistory } from "react-router-dom";


const HomePage = () => {
  const [activeTab, setActiveTab] = useState("login");
  const history = useHistory();
 useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if (user) {
      history.push("/chats");
    }
  }, [history]);

  return (
    <div className="main_container">
      <div className="left">
        <img className="homepage_logo" src ={homepageLogo} alt='homepageLogo'/>
       <img className="frontPage" src={orangebackground} alt='chatLogin'/>
      </div>
      <div className="right">
      <div className="tab_buttons">
     <button  className={activeTab==="login"?"active":""}
     onClick={()=>setActiveTab("login")}>Login</button>
    &nbsp;&nbsp;&nbsp;
     <button className={activeTab==="signup" ? "active":""}
     onClick={()=>setActiveTab('signup')}>Signup</button>
      </div>
      <div className="tab-content">
        {activeTab === 'login' ? <Login /> : <Signup />}
      </div>
      </div>
    </div>
  )
};

export default HomePage;
