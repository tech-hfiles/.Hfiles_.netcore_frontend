

export const API_Lab_Reports = "https://localhost:44358/api/";
export const API_NEW_Data = "https://localhost:7113/api/";
// export const API_NEW_Data = "https://test.testhfiles.in/api/";

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

   SIGN_UP: {
      SignUpOTP: API_NEW_Data + "signup/otp",
      SignUpData: API_NEW_Data + "signup",
   },

   LOGIN: {
      LoginWithPassword: API_NEW_Data + "login/password",
      LoginOTP: API_NEW_Data + "login/otp",
      LoginWithOtp: API_NEW_Data + "login"
   },

   COUNTRY_LIST: {
      ListCountyCode: API_NEW_Data + "country/dialing-codes"
   },

   PROFILE_DETAILS: {
      List_Details: API_NEW_Data + "profile",
      FLAG: (userId: number) => `${API_NEW_Data}profile/${userId}/flag`,
      SEND_OTP: API_NEW_Data + "profile/email/send-otp",
      VERIFY_OTP: API_NEW_Data + "profile/email/verify-otp",
      PINCODE: API_NEW_Data + "pincode",
      UPDATE_PROFILE: API_NEW_Data + "profile",
      SubscripationProfile:(userId:number) => `${API_NEW_Data}profile/${userId}/subscription`
   },

   ADD_MEMEBER: {
      AddMember: API_NEW_Data + "members/add",
      ExistingMember: API_NEW_Data + "members/existing",
      List_Member: API_NEW_Data + "members",
      VerifyPhoneOTp: API_NEW_Data + "profile/phone/send-otp",
      SubmitOtpVerify: API_NEW_Data + "profile/phone/verify-otp",
      StorageList : (userId:number) => `${API_NEW_Data}user/${userId}/storage-usage`

   },

   VERIFYMEMBER: {
      IniteMember: API_NEW_Data + "members/invite/send-otp",
      InviteOTP: API_NEW_Data + "members/invite/verify-otp",
      InviteSetPassword: API_NEW_Data + "members/invite/set-password"
   },

   HFID: {
      ListHfid: (userId: number) => `${API_NEW_Data}users/${userId}/hfid`,
   },

   REPORTADDED: {
      AddReports: (userId: number) => `${API_NEW_Data}user/${userId}/reports/upload`,
      ShowReports: API_NEW_Data + "user/reports",
      DeleteReport: (reportId: number) => `${API_NEW_Data}report/${reportId}/delete`,
      ShareReport: API_NEW_Data + "reports/share",
      EditReport: (reportId: number) => `${API_NEW_Data}report/${reportId}/edit`
   },

   MEDICALHISTORY: {
      MedicalList: API_NEW_Data + "surgery/user",
      AddMedical: (userId: number) => `${API_NEW_Data}surgery/${userId}/add`,
      EditMedical: API_NEW_Data + "surgery",
      DeleteMedical: API_NEW_Data + "surgery",
      AllDataList: (userId: number) => `${API_NEW_Data}user/${userId}/medical/history`,
      AddMetrix: (userId: number) => `${API_NEW_Data}user/${userId}/metrics`,
      AddSocial: (userId: number) => `${API_NEW_Data}social/history/${userId}/update`,
      AdddynamicAllergies: (userId: number) => `${API_NEW_Data}user/${userId}/allergy/dynamic`,
      AddStaticAllergies: (userId: number) => `${API_NEW_Data}user/${userId}/allergy/update`,
      AdddynamicDesease: (userId: number) => `${API_NEW_Data}user/${userId}/disease/dynamic/type`,
      DiseaseUpdate: (userId: number) => `${API_NEW_Data}user/${userId}/disease/update`,
      PDFGet: (userId: number) => `${API_NEW_Data}user/${userId}/medical/share-pdf`,
      EditDesease: (userId:number,diseaseTypeId:number) => `${API_NEW_Data}user/${userId}/disease/dynamic/${diseaseTypeId}/edit`,
      DeleteDesease: (userId:number,diseaseTypeId:number) => `${API_NEW_Data}user/${userId}/disease/dynamic/${diseaseTypeId}`,
      EditAllergy: (userId:number , dynamicAllergyId:number) => `${API_NEW_Data}user/${userId}/allergy/dynamic/${dynamicAllergyId}/edit`,
      DeleteAllergy: (userId:number , dynamicAllergyId:number) => `${API_NEW_Data}user/${userId}/allergy/dynamic/${dynamicAllergyId}`
   },

   REQUESTS: {
      ListRequests: (userId: number) => `${API_NEW_Data}member/${userId}/requests`,
      RESPOND_REQUEST: API_NEW_Data + "requests/respond",
      DeleteMember: (id: number) => `${API_NEW_Data}members/${id}/delete`,
      EditMember: (id: number) => `${API_NEW_Data}members/${id}/edit`,
   },

   SUBSCRIPATION: {
      Create_Order: API_NEW_Data + "Subscription/create-order",
      Verify_Payment: API_NEW_Data + "Subscription/payment-verification",
      Submit_Query : API_NEW_Data + "Subscription/submit-query"
   },

   FOLDER : {
      CreateFolder : API_NEW_Data + "folder",
      // ListFolder :API_NEW_Data + "user",
      ListFolder : (userId:number) => `${API_NEW_Data}user/${userId}/folders`,
      EditFolder : API_NEW_Data + "folder",
      DeleteFolder : API_NEW_Data + "folder",
      UploadBatch: (userId: number, folderId: number) =>
      `${API_NEW_Data}user/${userId}/folder/${folderId}/reports/upload-batch`,
      GetReports: (userId: number, folderId: number) =>
      `${API_NEW_Data}user/${userId}/folder/${folderId}/reports`,
      DeleteReport: (userId: number, reportId: number) =>
         `${API_NEW_Data}user/${userId}/report/${reportId}/delete`,
      EditReport: (userId: number, reportId: number) =>
         `${API_NEW_Data}user/${userId}/report/${reportId}/edit`,
      AccessFolder : API_NEW_Data + "folders/access/grant",
      ShareFolder: API_NEW_Data + "folders/share"
   },

   FORGOT_PASSWORD : {
      ForgotOtpSend : API_NEW_Data + "password/forget/otp",
      Password_forgot : API_NEW_Data + "password/forget",
      Change_Password : API_NEW_Data + "profile/password/change"
   },

   FAMILYPRESCRIPATION : {
      ListFamilyData : (userId:number) => `${API_NEW_Data}UserPrescriptions/user/${userId}/prescriptions`,
      AllDataList : API_NEW_Data + "UserPrescriptions/prescription/master-data",
      AddFamilyMember : API_NEW_Data + "UserPrescriptions",
      EditFamilyMember : API_NEW_Data + "UserPrescriptions",
      DeleteFamilyMember : API_NEW_Data + "UserPrescriptions",
      ShareFmailyData : API_NEW_Data + "prescriptions/share"
   },

   IMMUNIZATION : {
      AddImmunization : API_NEW_Data + "users/immunizations",

   },

   FEEDBACk : {
      AddFeedBack : (userId:number) => `${API_NEW_Data}user/${userId}/feedback`
   }

}


