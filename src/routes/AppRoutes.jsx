import React from 'react'
import Home  from '../pages/home/Home';
import Login from '../pages/auth/Login'
import About from '../pages/home/About'
import { Route,Routes } from 'react-router-dom';
import Register from '../pages/auth/Register';
const AppRoutes = () => {
  return (
    <div>
      
      <Routes>
        <Route path = '/' element = {<Home></Home>}></Route>
        <Route path = '/login' element = {<Login></Login>}></Route>
            <Route path = '/register' element = {<Register></Register>}></Route>
            <Route path = '/about' element = {<About></About>}></Route>
            </Routes>
    </div>
  )
}

export default AppRoutes
