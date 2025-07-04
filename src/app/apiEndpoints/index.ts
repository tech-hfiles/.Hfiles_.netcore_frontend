

export const API_Lab_Reports = "https://localhost:44358/api/";
export const API_NEW_Data = "https://localhost:7113/api/";

export const endpoints = {
   Lab_Reports: {
      Loginwithpass: API_Lab_Reports + "Login",
      // Loginwithotp: API_Lab_Reports + "OtpLogin/send-otp",
      SignUpStart: API_Lab_Reports + "Signup/initiate",
      SignUpotp: API_Lab_Reports + "Signup/verify-otp",
      SignUpotpSubmit: API_Lab_Reports + "Signup/complete",
      abhaadharno: API_Lab_Reports + "abha/request-otp",
      abhaadharotpverify: API_Lab_Reports + "abha/verify-otp",
      abhacarddownload: API_Lab_Reports + "abha/download-card",
   },

   SIGN_UP :{
      SignUpOTP : API_NEW_Data + "signup/otp",
      SignUpData : API_NEW_Data + "signup",
   },

   LOGIN :{
      LoginWithPassword : API_NEW_Data + "login/password",
      LoginOTP : API_NEW_Data + "login/otp",
      LoginWithOtp : API_NEW_Data + "login"
   },

   COUNTRY_LIST : {
      ListCountyCode: API_NEW_Data + "country/dialing-codes"
   },

   PROFILE_DETAILS : {
    List_Details : API_NEW_Data + "profile",
    FLAG : (userId:number) => `${API_NEW_Data}profile/${userId}/flag`,
    SEND_OTP: API_NEW_Data + "profile/email/send-otp",
    VERIFY_OTP : API_NEW_Data + "profile/email/verify-otp",
    PINCODE : API_NEW_Data + "pincode",
    UPDATE_PROFILE : API_NEW_Data + "profile"
   },

   ADD_MEMEBER : {
      AddMember : API_NEW_Data + "members/add",
      ExistingMember : API_NEW_Data + "members/existing",
      List_Member : API_NEW_Data + "members",
      VerifyPhoneOTp : API_NEW_Data + "profile/phone/send-otp",
      SubmitOtpVerify : API_NEW_Data + "profile/phone/verify-otp"

   },

   VERIFYMEMBER : {
      IniteMember: API_NEW_Data + "members/invite/send-otp",
      InviteOTP: API_NEW_Data + "members/invite/verify-otp",
      InviteSetPassword: API_NEW_Data + "members/invite/set-password"
   },

   HFID :{
          ListHfid : (userId:number) => `${API_NEW_Data}users/${userId}/hfid`,
   },

   REPORTADDED : {
      AddReports : (userId:number) => `${API_NEW_Data}user/${userId}/reports/upload`,
      ShowReports : API_NEW_Data + "user/reports",
      DeleteReport : (reportId:number) => `${API_NEW_Data}report/${reportId}/delete`,
      ShareReport : API_NEW_Data + "reports/share",
      EditReport : (reportId:number) => `${API_NEW_Data}report/${reportId}/edit`
   }

}


