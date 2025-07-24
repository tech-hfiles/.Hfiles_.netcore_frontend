'use client';

import React from 'react';
import Link from 'next/link';
import Header from '../components/LandingPage/Header';
import Footer from '../components/LandingPage/Footer';
const PrivacyPolicy = () => {
  return (
    <div>
      {/* Add the font link */}
      <link href="https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@400;700&display=swap" rel="stylesheet" />
      
      <div className="privacy_main">
           <Link href="/" className="back-arrow-btn">
            Back
          </Link>
<Header/>
        {/* Decorative Elements */}
        <div className="blue_triangle blue_triangle_top_left"></div>
        <div className="blue_triangle blue_triangle_top_right"></div>
        <div className="blue_triangle blue_triangle_right"></div>
        <div className="blue_triangle blue_triangle_bottom_left"></div>
        <div className="blue_triangle blue_triangle_bottom_right"></div>
        <div className="plus_element plus_top_left">+</div>
        <div className="plus_element plus_bottom_right">+</div>

        <div className="content-wrapper">
          <div className="content-container">
            <div className="inner_div">
              <div className="heading">
                <h1>Privacy Policy</h1>
              </div>
              <div className="desciption">
                <p>HFILES PRIVACY POLICY</p>
                
                <p>
                  This Privacy Policy pertains and regulates the access and use of the website{' '}
                  <a href="http://hfiles.in/">http://hfiles.in/</a> which is operated and owned by HEALTH FILES MEDICO PRIVATE LIMITED.
                </p>
                
                <p>
                  This Privacy Policy outlines the procedures and protocols employed by the website{' '}
                  <a href="http://hfiles.in/">http://hfiles.in/</a> in managing and handling personal and usage information of users (referred to as You or User), in compliance with the relevant laws and regulations of India. The Privacy Policy is subject to modifications at the discretion of HEALTH FILES MEDICO PRIVATE LIMITED without prior notice. Any alterations to the Privacy Policy will be communicated to all account holders of{' '}
                  <a href="http://hfiles.in/">http://hfiles.in</a>. The Privacy Policy for{' '}
                  <a href="http://hfiles.in/">http://hfiles.in</a> has been designed to be straightforward and informative, detailing the collection of personal and usage information from users. Users who may not be familiar with certain technical terms are encouraged to review the key terms provided.
                </p>

                <ol type="1">
                  <li>
                    <p>
                      The website <a href="http://hfiles.in/">http://hfiles.in/</a> permits users to navigate its content without requiring registration. Consequently, it does not collect any identifiable personal data such as names, phone numbers, or email addresses that could be used to distinguish individuals.
                    </p>
                  </li>
                  <li>
                    <p>
                      If the user desires to register for an account on the website{' '}
                      <a href="http://hfiles.in/">http://hfiles.in/</a>, they are required to furnish their full name, personal mobile number, and email address.
                    </p>
                  </li>
                  <li>
                    <p>
                      The <a href="http://hfiles.in/">http://hfiles.in/</a> Portal gathers data including Internet Protocol (IP) Addresses, Domain name, Browser type, Operating System, Date and Time of the visit, Pages visited, Referring URLs, among other information. It is important to note that there is no intention to correlate this data with the identities of individuals visiting the portal, unless there is an unlawful attempt to breach the{' '}
                      <a href="http://hfiles.in/">http://hfiles.in/</a> service, privacy policy, or violate the provisions of the Information Technology Act, 2000, or any current Rules, Legislation of India.
                    </p>
                  </li>
                  <li>
                    <p>
                      The <a href="http://hfiles.in/">http://hfiles.in/</a> System utilizes cookies to store temporary session data aiming to enhance user experience and customize preferences. It is important to note that only temporary cookies are employed, and users have the ability to manage cookie settings through their web browser or other tools. Disabling cookies may disrupt the continuity of the{' '}
                      <a href="http://hfiles.in/">http://hfiles.in/</a> session. Users are recommended to log out after each session to mitigate potential misuse of cookie data.
                    </p>
                  </li>
                  <li>
                    <p>
                      The <a href="http://hfiles.in/">http://hfiles.in/</a> System ensures the confidentiality of user information, specifically details obtained during registration, by refraining from sharing or disclosing such data to any party, be it an individual or an organization, unless mandated by legal requirements or explicitly authorized by the account holder.
                    </p>
                  </li>
                  <li>
                    <p>
                      Account holders of <a href="http://hfiles.in/">http://hfiles.in/</a> retain the autonomy to voluntarily share their uploaded documents or URIs with any party, whether an individual or an organization, by providing explicit consent. It is important to note that the responsibility for sharing documents with requesters or other entities rests solely with the user, as the{' '}
                      <a href="http://hfiles.in/">http://hfiles.in/</a> system primarily serves as a platform for facilitating document sharing.
                    </p>
                  </li>
                  <li>
                    <p>
                      The individual holding the account on <a href="http://hfiles.in/">http://hfiles.in/</a> is accountable for all self-uploaded documents. It is prohibited for the account holder to share or engage in any activities that contravene the terms and conditions, privacy policy, or regulations outlined in the Information Technology Act, 2000, or any other prevailing legislation.
                    </p>
                  </li>
                  <li>
                    <p>
                      Collected personal and usage data may be disclosed to third-party organizations by HEALTH FILES MEDICO PRIVATE LIMITED if there is a genuine belief that such action is necessary to comply with regulations, legal proceedings, or official government requests; adhere to relevant laws; identify, prevent, or resolve instances of fraud, security breaches, or technical problems; or safeguard the rights, assets, or well-being of{' '}
                      <a href="http://hfiles.in/">http://hfiles.in/</a>, other users, or the general public as mandated or permitted by laws of India.
                    </p>
                  </li>
                  <li>
                    <p>
                      The personally identifiable information submitted on the{' '}
                      <a href="http://hfiles.in/">http://hfiles.in/</a> Portal/Website is not sold or shared with any third party, whether public or private, except as outlined in the aforementioned conditions. Any data provided to this website will be safeguarded against loss, unauthorized access, disclosure, alteration, or destruction to a reasonable extent.
                    </p>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          /* Add global body reset */
          :global(body) {
            margin: 0;
            padding: 0;
            overflow: hidden;
          }

          :global(html) {
            margin: 0;
            padding: 0;
            overflow: hidden;
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          .privacy_main {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100vw;
            height: 100vh;
            overflow: hidden;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }

          h1 {
            text-align: center;
            color: #333;
            font-weight: bold;
            margin-bottom: 1rem;
            font-size: 2.5rem;
          }

          h2 {
            color: #0331b5;
            margin-top: 2rem;
            margin-bottom: 1rem;
            font-size: 1.5rem;
          }

          p {
            font-size: 16px;
            margin: 20px 0;
            line-height: 1.8;
            text-align: justify;
          }

          ol {
            list-style-type: decimal;
            margin: 20px;
            padding-left: 40px;
          }

          ol li {
            margin: 15px 0;
            line-height: 1.6;
          }

          ol li p {
            margin: 10px 0;
          }

          a {
            color: #0331b5;
            text-decoration: underline;
          }

          a:hover {
            color: #0512b9;
          }

          .back-arrow-btn {
            position: absolute;
            left: 10%;
            top: 3%;
            color: gray;
            padding: 8px 20px;
            border-radius: 50px;
            border: 2px solid gray;
            cursor: pointer;
            font-family: 'Red Hat Display', sans-serif;
            font-weight: 700;
            font-size: 16px;
            text-decoration: none;
            background: rgba(255, 255, 255, 0.9);
            transition: all 0.3s ease;
            z-index: 10;
            backdrop-filter: blur(10px);
          }

          .back-arrow-btn:hover {
            color: #0512b9;
            border-color: #0512b9;
            transform: translateX(-5px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          }

          .content-wrapper {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            padding: 5rem 2rem 2rem 2rem;
            overflow: hidden;
          }

          .content-container {
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            overflow: hidden;
          }

          .inner_div {
            max-width: 1000px;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.95);
            padding: 2rem;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }

          .heading {
            flex-shrink: 0;
            margin-bottom: 1rem;
          }

          .desciption {
            flex: 1;
            overflow-y: auto;
            padding-right: 1rem;
          }

          .desciption::-webkit-scrollbar {
            width: 8px;
          }

          .desciption::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }

          .desciption::-webkit-scrollbar-thumb {
            background: #0331b5;
            border-radius: 10px;
          }

          .desciption::-webkit-scrollbar-thumb:hover {
            background: #0512b9;
          }

          /* Decorative Elements */
          .blue_triangle {
            position: absolute;
            width: 0;
            height: 0;
            z-index: 1;
          }

          .blue_triangle_top_left {
            top: 0;
            left: 0;
            border-style: solid;
            border-width: 80px 0 0 80px;
            border-color: transparent transparent transparent #0331b5;
          }

          .blue_triangle_top_right {
            top: 0;
            right: 0;
            border-style: solid;
            border-width: 0 80px 80px 0;
            border-color: transparent #0331b5 transparent transparent;
          }

          .blue_triangle_bottom_left {
            bottom: 0;
            left: 0;
            border-style: solid;
            border-width: 0 0 80px 80px;
            border-color: transparent transparent #0331b5 transparent;
          }

          .blue_triangle_bottom_right {
            bottom: 0;
            right: 0;
            border-style: solid;
            border-width: 80px 80px 0 0;
            border-color: #0331b5 transparent transparent transparent;
          }

          .blue_triangle_right {
            top: 50%;
            right: 0;
            transform: translateY(-50%);
            border-style: solid;
            border-width: 40px 60px 40px 0;
            border-color: transparent #0331b5 transparent transparent;
          }

          .plus_element {
            position: absolute;
            color: #0331b5;
            font-size: 2rem;
            font-weight: bold;
            z-index: 2;
          }

          .plus_top_left {
            top: 2rem;
            left: 2rem;
          }

          .plus_bottom_right {
            bottom: 2rem;
            right: 2rem;
          }

          /* Responsive Design */
          @media (max-width: 540px) {
            .blue_triangle_top_left {
              display: none;
            }

            .back-arrow-btn {
              left: 5%;
              top: 2%;
            }

            .inner_div {
              padding: 1.5rem;
            }

            .content-wrapper {
              padding: 4rem 1rem 2rem 1rem;
            }

            h1 {
              font-size: 2rem;
            }

            .desciption {
              padding-right: 0.5rem;
            }
          }

          @media (max-width: 768px) {
            .blue_triangle_top_left,
            .blue_triangle_top_right,
            .blue_triangle_bottom_left,
            .blue_triangle_bottom_right,
            .blue_triangle_right {
              border-width: 40px;
            }

            .blue_triangle_top_left {
              border-width: 40px 0 0 40px;
            }

            .blue_triangle_top_right {
              border-width: 0 40px 40px 0;
            }

            .blue_triangle_bottom_left {
              border-width: 0 0 40px 40px;
            }

            .blue_triangle_bottom_right {
              border-width: 40px 40px 0 0;
            }

            ol {
              padding-left: 20px;
            }
          }

          @media (min-width: 768px) and (max-width: 991px) {
            .blue_triangle_bottom_right {
              position: absolute !important;
              bottom: 0px !important;
            }
          }

          @media (min-width: 1022px) and (max-width: 1024px) {
            .blue_triangle_bottom_right {
              position: absolute !important;
              bottom: 0px !important;
            }
          }

          @media (min-width: 1280px) {
            .content-wrapper {
              padding-top: 3rem;
            }
          }

          @media (min-width: 1024px) and (max-height: 600px) {
            .desciption {
              max-height: 50vh;
            }
          }
        `}</style>
        
      </div>
      <Footer/>
    </div>
  );
};

export default PrivacyPolicy;