import React from 'react'
import { BrowserRouter, Routes, Route} from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AppRoutes from './routes/AppRoutes'
import Sidebar from './components/Sidebar'

const App = () => {
  return (
    <div>
      
      <BrowserRouter>
        <Navbar></Navbar>
        <div className='flex min-h-screen mt-10 ml-5'>
          {/* <Sidebar></Sidebar> */}
          <div className='flex-1'>
          <AppRoutes> </AppRoutes>
          </div>
        </div>

        <Footer></Footer>
        </BrowserRouter>

    </div>
  )
}

export default App
