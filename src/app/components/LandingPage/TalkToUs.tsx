import React from "react"; 
import Image from 'next/image';
 export default function TalkToUs() 
 {   
  return (     <section id="talkus" className="talkus_section">      
   <div className="main_talk_to_us">        
     <div className="talkus_header">          
       <h1>Talking To Us Is Easy</h1>        
          <hr />          
           <p>           
            
              Have questions about Health Files, want to explore a partnership, or           
                interested in joining our team?      
                     </p>     
                           <h3>We'd love to hear from you!</h3>      
                              </div>         
                               <div className="talkus_icon_row" >         
                                  <div className="giveus_call">           
                                      <img loading="lazy"  decoding="async"         
                                            src="/journal-page-images/article/phone-icon.png"            
                                               alt="call to health files"             />      
                                                      <h2>Give Us Call</h2>            
                                                       <a href="tel:+919978043453">             
                                                          <p>+91 9978043453</p>             </a>           </div>            <div className="giveus_call">             <img               loading="lazy"               decoding="async"               src="/journal-page-images/article/email-icon.png"               alt="mail to health files"             />             <h2>Write to us</h2>             <a href="mailto:contact@hfiles.in">               <p>contact@hfiles.in</p>             </a>           </div>            <div className="giveus_call">             <img               loading="lazy"               decoding="async"               src="/journal-page-images/article/whatsapp-icon.png"               alt="call to health files"             />             <h2>WhatsApp us</h2>             <a               href="https://api.whatsapp.com/send?phone=919978043453&text=Hi"               target="_blank"              
                                       rel="noopener noreferrer"             >        
                                              <p>+91 9978043453</p>             </a>           </div>         </div>       </div>     </section>   ); };