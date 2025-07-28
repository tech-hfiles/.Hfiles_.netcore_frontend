'use client';
export const runtime = 'edge'
import React, { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import MasterHome from '../components/MasterHome';
import { useRouter } from 'next/navigation';

function Dashboard() {
  const [userName, setUserName] = useState('');
  const router = useRouter();

  useEffect(() => {
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      setUserName(storedUserName);
    }
  }, []);

  const handleHFilesClick = () => {
    router.push('/myHfiles');
  };

  const handleMedicalClick = () => {
    router.push('/medicalHistory');
  };

  return (
    <MasterHome>
      <>
        <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          margin: 0 !important;
          padding: 0 !important;
          height: 100%;
          font-family: 'Poppins', sans-serif;
        }

        .welcome-section {
          text-align: center;
          margin: 30px 70px;
        }

        .welcome-section p {
          font-size: 24px;
          font-weight: 500;
          color: black;
          text-align: center;
          line-height: 34px;
          letter-spacing: 1px;
          font-family: 'Montserrat', sans-serif;
        }

        .welcome-section span {
          color: #0331B5;
          font-weight: 600;
        }

        .welcome_divider {
          height: 1px;
          background-color: #333333;
          width: 80%;
          max-width: 200px;
          margin: 10px auto;
        }

        .journal_container {
          position: relative;
          width: 100%;
        }

        .card-container {
          
          margin: 0 30px 75px 30px;
          padding: 30px;
          border-radius: 12px;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(180deg, #FFFFFF 7%, #CAE5FF 85%);
          position: relative;
          z-index: 1;
          box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(0, 0, 0, 0.3);
        }

        .background-wrapper-desktop {
          position: absolute;
          top: 0;
          left: 7.5%;
          width: 45vw;
          max-width: 685px;
          height: 100%;
          background-image: url('https://via.placeholder.com/600x400/FFE4B5/000000?text=Samanta');
          background-size: contain;
          background-position: top left;
          background-repeat: no-repeat;
          z-index: -1;
        }

        .journal_main {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          justify-content: space-evenly;
          margin: 0 20px;
          gap: 80px;
          width: 100%;
        }

        .image_container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .image_container img {
          max-width: 100%;
          width: 550px;
          height: auto;
          object-fit: contain;
        }

        .image_content {
          text-align: center;
          color: black;
          font-size: 23px;
          letter-spacing: 2px;
          font-family: 'Montserrat', sans-serif;
        }

        .divider {
          width: 1px;
          background-color: #333333;
          min-height: 300px;
          align-self: center;
        }

        .content_container {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .content_header {
          margin-bottom: 10px;
        }

        .content_header p {
          text-align: center;
          font-size: 22px;
          font-weight: 600;
          margin: 0;
          font-family: 'Poppins', sans-serif;
        }

        .content_header span {
          color: #0331B5;
        }

        .content_divider {
          height: 1px;
          background-color: #333333;
          width: 80%;
          max-width: 125px;
          margin: 10px auto;
          font-weight: normal;
        }

        .my_profile {
          height: 65px;
          border-radius: 17.5px;
          margin: 0 0 1.5rem 0;
          background-color: white;
          box-shadow: 0px 5px 10px #393838;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          padding: 65px 25px;
          gap: 10px;
          text-decoration: none;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .my_profile:hover {
          background-color: #F9E380;
        }

        .default_profile {
          background-color: #F9E380 !important;
        }

        .profile_row {
          display: flex;
          align-items: center;
          flex: 1;
        }

        .image_wrapper {
          width: 100px;
          height: 100px;
          overflow: hidden;
          background-color: white;
          display: flex;
          justify-content: center;
          align-items: center;
          border: 1px solid #3333;
          border-radius: 12px;
          margin-right: 20px;
        }

        .image_wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 0;
        }

        .my_profile_content {
          display: flex;
          flex-direction: column;
          gap: 5px;
          max-width: 75%;
        }

        .my_profile h3 {
          color: black;
          font-weight: 600;
          font-size: 25px;
          margin: 0;
          font-family: 'Poppins', sans-serif;
        }

        .card-description {
          color: black;
          font-size: 19px;
          font-weight: 300;
          font-family: 'Montserrat', sans-serif;
        }

        .card_icon {
          color: #333333;
          font-size: 20px;
        }

        .mobile-view {
          display: none;
        }

        .tablet-only {
          display: none;
        }

        .mobile-only {
          display: none;
        }

        .user-info {
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          color: #0331B5;
          font-size: 18px;
        }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .mobile-view {
            display: block;
          }

          .desktop-view {
            display: none;
          }

          .tablet-only {
            display: none;
          }

          .mobile-only {
            display: block;
          }

          .mobile-container {
            padding: 20px;
            background-color: #f8f9fa;
            min-height: 100vh;
          }

          .mobile-header {
            text-align: center;
            margin-bottom: 20px;
          }

          .mobile-header h1 {
            font-size: 28px;
            font-weight: 600;
            color: #333;
            margin-bottom: 20px;
            font-family: 'Poppins', sans-serif;
          }

          .mobile-samantha-section {
            background: linear-gradient(180deg, #E3F2FD 0%, #BBDEFB 100%);
            border-radius: 20px;
            padding: 30px 20px;
            text-align: center;
            margin-bottom: 30px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }

          .mobile-samantha-image {
            width: 200px;
            height: 150px;
            margin: 0 auto 20px;
            background-color: #f0f0f0;
            border-radius: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            color: #666;
          }

          .mobile-samantha-text {
            font-size: 16px;
            font-weight: 500;
            color: #333;
            font-family: 'Poppins', sans-serif;
            margin-bottom: 20px;
          }

          .mobile-hfiles-card {
            background-color: #FFF3CD;
            border-radius: 15px;
            padding: 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .mobile-hfiles-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
          }

          .mobile-hfiles-content {
            display: flex;
            align-items: center;
            flex: 1;
          }

          .mobile-hfiles-icon {
            width: 50px;
            height: 50px;
            background-color: #0331B5;
            border-radius: 10px;
            margin-right: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
          }

          .mobile-hfiles-text h3 {
            font-size: 18px;
            font-weight: 600;
            color: #333;
            margin: 0 0 5px 0;
            font-family: 'Poppins', sans-serif;
          }

          .mobile-hfiles-text p {
            font-size: 14px;
            color: #666;
            margin: 0;
            font-family: 'Montserrat', sans-serif;
          }

          .mobile-records-section {
            margin-top: 30px;
          }

          .mobile-records-header {
            text-align: center;
            margin-bottom: 20px;
          }

          .mobile-records-header h2 {
            font-size: 20px;
            font-weight: 500;
            color: #333;
            font-family: 'Poppins', sans-serif;
          }

          .mobile-records-header span {
            color: #0331B5;
            font-weight: 600;
          }

          .mobile-records-divider {
            height: 2px;
            background-color: #0331B5;
            width: 60px;
            margin: 10px auto;
          }

          .mobile-card {
            background-color: white;
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .mobile-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
          }

          .mobile-card-content {
            display: flex;
            align-items: center;
            flex: 1;
          }

          .mobile-card-icon {
            width: 50px;
            height: 50px;
            border-radius: 10px;
            margin-right: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
          }

          .mobile-card-icon.medical {
            background-color: #FFE5E5;
            color: #E74C3C;
          }

          .mobile-card-icon.journal {
            background-color: #F0E5FF;
            color: #9B59B6;
          }

          .mobile-card-text h3 {
            font-size: 18px;
            font-weight: 600;
            color: #333;
            margin: 0 0 5px 0;
            font-family: 'Poppins', sans-serif;
          }

          .mobile-card-text p {
            font-size: 14px;
            color: #666;
            margin: 0;
            font-family: 'Montserrat', sans-serif;
          }

          .mobile-card-arrow {
            color: #666;
          }
        }

        @media (max-width: 480px) {
          .mobile-header h1 {
            font-size: 24px;
          }

          .mobile-samantha-text {
            font-size: 14px;
          }

          .mobile-hfiles-text h3 {
            font-size: 16px;
          }

          .mobile-hfiles-text p {
            font-size: 12px;
          }

          .mobile-card-text h3 {
            font-size: 16px;
          }

          .mobile-card-text p {
            font-size: 12px;
          }

          .mobile-container {
            padding: 15px;
          }
        }

        /* Laptop Responsiveness */
        @media (min-width: 1024px) and (max-width: 1200px) {
          .welcome-section p {
            font-size: 22px;
          }

          .image_content {
            font-size: 19px;
          }

          .content_header p {
            font-size: 17px;
          }

          .image_container img {
            width: 325px;
          }

          .background-wrapper-desktop {
            position: absolute;
            top: 0;
            left: 0;
            width: 45vw;
            max-width: 650px;
            height: 100%;
            background-image: url('https://via.placeholder.com/600x400/FFE4B5/000000?text=Samanta');
            background-size: contain;
            background-position: top left;
            background-repeat: no-repeat;
            z-index: -1;
          }

          .image_wrapper {
            width: 75px;
            height: 75px;
          }

          .my_profile h3 {
            font-size: 19px;
          }

          .my_profile {
            padding: 50px 25px !important;
          }

          .card-description {
            font-size: 13px;
          }
        }

        /* Tablet Responsiveness */
        @media (min-width: 769px) and (max-width: 1023px) {
          .mobile-view {
            display: block;
          }

          .desktop-view {
            display: none;
          }

          .mobile-only {
            display: none;
          }

          .tablet-only {
            display: block;
          }

          .journal_main {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
            box-shadow: -5px 7.5px 10px #5f5959a6;
            border-radius: 12px;
            padding: 15px 20px 25px 20px;
            background: linear-gradient(transparent 50%, #CAE5FF 85%), url('https://via.placeholder.com/600x400/FFE4B5/000000?text=Samanta');
            background-size: contain;
            background-position: top;
            background-repeat: no-repeat;
            margin: 0 30px;
          }

          .image_container {
            background: none;
            order: -1;
          }

          .content_container {
            order: 1;
            width: 100%;
          }

          .welcome-section {
            display: none;
          }

          .image_content {
            font-size: 24px;
            letter-spacing: 2px;
            font-weight: 500;
          }

          .my_profile {
            padding: 70px 25px 70px 35px;
          }

          .card-container {
            margin: 20px 0 0 0;
            padding: 0;
            background: none;
            border: none;
            box-shadow: none;
          }

          .card-description {
            font-size: 21px;
          }

          .my_profile img {
            width: 60px;
          }

          .my_profile h3 {
            font-size: 25px;
          }

          .outside-card {
            margin: 30px 50px 120px 50px;
            padding-bottom: 100px;
            display: flex;
            flex-direction: column;
            gap: 25px;
          }

          .content_header {
            margin-bottom: unset;
          }

          .content_header p {
            margin: 0;
            font-size: 23px;
            font-weight: 500;
          }

          .my_profile_section {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .divider {
            display: none;
          }

          .flex-nowrap {
            display: flex;
            flex-wrap: nowrap;
          }
        }
      `}</style>

        {/* Desktop View */}
        <div className="dashboard desktop-view" style={{ overflowX: 'hidden' }}>
          <div className="welcome-section">
            <p>Welcome back! Your <span>healthiest self</span> is just a click away. Let's take that next step together!</p>
            <div className="welcome_divider"></div>
          </div>

          <div className="journal_container">
            <div className="card-container">
              <div className="background-wrapper-desktop"></div>
              <div className="journal_main">
                <div className="image_container">
                  <div className="user-info">Hi {userName}!</div>
                  <img src="/SamantaGIF.gif" alt="Personal Health Manager" />
                  <div className="image_content">
                    <span>I Am Samantha, Your Personal Health Manager</span>
                  </div>
                </div>

                <div className="divider"></div>

                <div className="content_container">
                  <div className="content_header">
                    <p>Your <span>health records</span> are just a click away.</p>
                    <div className="content_divider"></div>
                  </div>

                  <div className="my_profile default_profile" onClick={handleHFilesClick} >
                    <div className="profile_row">
                      <div className="image_wrapper">
                        <img src="/aad67678cd2f3dbe434a2fe7cb0455b82a85482b.png" alt="H-Files" />
                      </div>
                      <div className="my_profile_content">
                        <h3>My H-Files</h3>
                        <span className="card-description">We've organized all your family's health reports, right here for you.</span>
                      </div>
                    </div>
                    <div className="card_icon">
                      <ChevronRight size={24} />
                    </div>
                  </div>

                  <div className="my_profile " onClick={handleMedicalClick}>
                    <div className="profile_row">
                      <div className="image_wrapper">
                        <img src="/Reception Page/health-report-icon.png" alt="Medical History" />
                      </div>
                      <div className="my_profile_content">
                        <h3>My Medical History</h3>
                        <span className="card-description">Access your family's complete medical history anytime.</span>
                      </div>
                    </div>
                    <div className="card_icon">
                      <ChevronRight size={24} />
                    </div>
                  </div>

                  <div className="my_profile" >
                    <div className="profile_row">
                      <div className="image_wrapper">
                        <img src="/Reception Page/journal.png" alt="Journal" />
                      </div>
                      <div className="my_profile_content">
                        <h3>Journal</h3>
                        <span className="card-description">Stay informed with doctor-written health articles.</span>
                      </div>
                    </div>
                    <div className="card_icon">
                      <ChevronRight size={24} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile & Tablet View */}
        <div className="dashboard mobile-view">
          {/* Tablet View - Original Structure */}
          <div className="tablet-only">
            <div className="journal_container">
              <div className="card-container">
                <div className="journal_main">
                  <div className="image_container">
                    <div className="user-info">Hi {userName}!</div>
                    <img src="/SamantaGIF.gif" alt="Personal Health Manager" />
                    <div className="image_content">
                      <span>I Am Samantha, Your Personal Health Manager</span>
                    </div>
                  </div>

                  <div className="content_container" >
                    <div className="my_profile default_profile" onClick={handleHFilesClick}>
                      <div className="profile_row flex-nowrap">
                        <div className="image_wrapper">
                          <img
                            src="/aad67678cd2f3dbe434a2fe7cb0455b82a85482b.png"
                            alt="H-Files"
                          />

                        </div>
                        <div className="my_profile_section"  onClick={handleHFilesClick}>
                          <h3>My H-Files</h3>
                          <span className="card-description">
                            We've organized all your family's health reports, right here for you.
                          </span>
                        </div>
                      </div>
                      <div className="card_icon">
                        <ChevronRight size={20} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="outside-card">
              <div className="content_header">
                <p>Your <span>health records</span> are just a click away.</p>
                <div className="content_divider"></div>
              </div>

              <div className="my_profile" onClick={handleMedicalClick} >
                <div className="profile_row flex-nowrap">
                  <div className="image_wrapper">
                    <img src="/ea38dbe1df7c2a5e09475ac6a4b7ededbed17414.png" alt="Medical History" />
                  </div>
                  <div className="my_profile_section">
                    <h3>My Medical History</h3>
                    <span className="card-description">Access your family's complete medical history anytime.</span>
                  </div>
                </div>
                <div className="card_icon">
                  <ChevronRight size={20} />
                </div>
              </div>

              <div className="my_profile" >
                <div className="profile_row flex-nowrap">
                  <div className="image_wrapper">
                    <img src="/52dfa155236ba07b3722d5d6eb1a4294762ff447.png" alt="Journal" />
                  </div>
                  <div className="my_profile_section">
                    <h3>Journal</h3>
                    <span className="card-description">Stay informed with doctor-written health articles.</span>
                  </div>
                </div>
                <div className="card_icon">
                  <ChevronRight size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile View - New Structure */}
          <div className="mobile-only">
            <div className="mobile-container">
              <div className="mobile-header">
                <h1>Hi {userName}!</h1>
              </div>

              <div className="mobile-samantha-section">
                <div className="mobile-samantha-image">
                    <img src="/SamantaGIF.gif" alt="Personal Health Manager" />

                </div>
                <div className="mobile-samantha-text">
                  I Am Samantha, Your Personal Health Manager
                </div>
                <div className="mobile-hfiles-card" onClick={handleHFilesClick}>
                  <div className="mobile-hfiles-content">
                    <img src="/aa3955112e28185d2195e877e084fc7c2fb504db.png" alt="Personal Health Manager" />
                    <div className="mobile-hfiles-text">
                      <h3>My H-Files</h3>
                      <p>We've organized all your family's health reports, right here for you.</p>
                    </div>
                  </div>
                  <ChevronRight size={20} />
                </div>
              </div>

              <div className="mobile-records-section">
                <div className="mobile-records-header">
                  <h2>Your <span>health records</span> are just a click away.</h2>
                  <div className="mobile-records-divider"></div>
                </div>

                <div className="mobile-card" onClick={handleMedicalClick}>
                  <div className="mobile-card-content">
                    <img src="/d3e5b47f6c0a3f656e1530f9131f0592186e4ddc.png" alt="Personal Health Manager" />
                    <div className="mobile-card-text">
                      <h3>My Medical History</h3>
                      <p>Access your family's complete medical history anytime.</p>
                    </div>
                  </div>
                  <div className="mobile-card-arrow">
                    <ChevronRight size={20} />
                  </div>
                </div>

                <div className="mobile-card" >
                  <div className="mobile-card-content">
                    <img
                      src="/52dfa155236ba07b3722d5d6eb1a4294762ff447.png"
                      alt="Personal Health Manager"
                      width="50"
                    />
                    <div className="mobile-card-text">
                      <h3>Journal</h3>
                      <p>Stay informed with doctor-written health articles.</p>
                    </div>
                  </div>
                  <div className="mobile-card-arrow">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </>
    </MasterHome>
  );
}

export default Dashboard;