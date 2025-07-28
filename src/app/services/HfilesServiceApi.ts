import axios from "axios";
import { endpoints } from "../apiEndpoints";
import axiosInstance from "../utils/axiosClient";


export const Login = async (data: any) => {
  return axios.post(`${endpoints.Lab_Reports.Loginwithpass}`, data);
};

// export const otplogin = async (data: any) => {
//   return axios.post(`${endpoints.Lab_Reports.Loginwithotp}`, data);
// };

export const UserSignUp = async (data: any) => {
  return axios.post(`${endpoints.Lab_Reports.SignUpStart}`, data);
};

export const UserSignUpOtp = async (data: any) => {
  return axios.post(`${endpoints.Lab_Reports.SignUpotp}`, data);
};
export const UserSignUpOtpSubmit = async (data: any) => {
  return axios.post(`${endpoints.Lab_Reports.SignUpotpSubmit}`, data);
};
export const AbhaAdharCard = async (data: any) => {
  return axios.post(`${endpoints.Lab_Reports.abhaadharno}`, data);
};
export const AbhaAdharCardOtpVerify = async (data: any) => {
  return axios.post(`${endpoints.Lab_Reports.abhaadharotpverify}`, data);
};
export const AbhaCarddownload = async (data: any) => {
  return axios.post(`${endpoints.Lab_Reports.abhacarddownload}`, data);
};


// NEW  API 

export const SignUpOTPVerify = async (data: any) => {
  return axios.post(`${endpoints.SIGN_UP.SignUpOTP}`, data)
};

export const AddSignUp = async (data: any) => {
  return axios.post(`${endpoints.SIGN_UP.SignUpData}`, data)
}


// Login 

export const LoginPassword = async (data: any) => {
  return axios.post(`${endpoints.LOGIN.LoginWithPassword}`, data)
}


export const LoginOTp = async (data: any) => {
  return axios.post(`${endpoints.LOGIN.LoginOTP}`, data)
}


export const LoginWithOTPhahaha = async (data: any) => {
  return axios.post(`${endpoints.LOGIN.LoginWithOtp}`, data)
}
// County code List

export const listCounty = async () => {
  return axios.get(`${endpoints.COUNTRY_LIST.ListCountyCode}`)
}


// Profile Details 

export const BasicDetailsList = async (userId: number) => {
  return axiosInstance.get(`${endpoints.PROFILE_DETAILS.List_Details}/${userId}`)
}


export const ListFlag = async (userId: number, countryCode: string) => {
  return axiosInstance.get(endpoints.PROFILE_DETAILS.FLAG(userId), {
    params: { countryCode }
  });
};

export const PlaneShift = async (userId:number) =>{
  return axiosInstance.get(endpoints.PROFILE_DETAILS.SubscripationProfile(userId))
}


export const OTPSend = async (data: any) => {
  return axiosInstance.post(`${endpoints.PROFILE_DETAILS.SEND_OTP}`, data)
}


export const VerigyOTps = async (data: any) => {
  return axiosInstance.post(`${endpoints.PROFILE_DETAILS.VERIFY_OTP}`, data)
}

export const ListPincode = async (pincode: string) => {
  return axiosInstance.get(`${endpoints.PROFILE_DETAILS.PINCODE}/${pincode}`)
}


export const AddProfile = async (userId: number, data: any) => {
  return axiosInstance.patch(`${endpoints.PROFILE_DETAILS.UPDATE_PROFILE}/${userId}`, data)
}


/// Add Member

export const MemberAdd = async (userId: number, data: any) => {
  return axiosInstance.post(`${endpoints.ADD_MEMEBER.AddMember}/${userId}`, data)
}

export const MemberExistingAdd = async (userId: number, data: any) => {
  return axiosInstance.post(`${endpoints.ADD_MEMEBER.ExistingMember}/${userId}`, data)
}

export const MemberList = async (userId: number) => {
  return axiosInstance.get(`${endpoints.ADD_MEMEBER.List_Member}/${userId}`)
}

export const OTpVerifyMember = async (data: any) => {
  return axiosInstance.post(`${endpoints.ADD_MEMEBER.VerifyPhoneOTp}`, data)
}

export const OTpSubmitMember = async (data: any) => {
  return axiosInstance.post(`${endpoints.ADD_MEMEBER.SubmitOtpVerify}`, data)
}


export const ListStorage = async (userId:number) =>{
  return axiosInstance.get(endpoints.ADD_MEMEBER.StorageList(userId));
}


// INVITE MEMEBR 

export const InviteMember = async (payload: any) => {
  return axiosInstance.post(`${endpoints.VERIFYMEMBER.IniteMember}`, payload);
}

export const InviteOTPs = async (payload: any) => {
  return axiosInstance.post(`${endpoints.VERIFYMEMBER.InviteOTP}`, payload);
}

export const InvitePassword = async (payload: any) => {
  return axiosInstance.post(`${endpoints.VERIFYMEMBER.InviteSetPassword}`, payload);
}


// HFID 

export const ListHFID = async (userId: number) => {
  return axiosInstance.get(endpoints.HFID.ListHfid(userId));
};


// ADD Reports 

export const ReportAdd = async (userId: number, payload: FormData) => {
  return axiosInstance.post(endpoints.REPORTADDED.AddReports(userId), payload, {
  });
};

export const ListReport = async (userId?: number, reportType?: string) => {
  let url = `${endpoints.REPORTADDED.ShowReports}`;
  const params: string[] = [];

  if (userId !== undefined) {
    params.push(`userId=${userId}`);
  }

  if (reportType) {
    params.push(`reportType=${encodeURIComponent(reportType)}`);
  }

  if (params.length > 0) {
    url += `?${params.join('&')}`;
  }

  return axiosInstance.get(url);
};

export const DeleteReport = async (reportId: number) => {
  return axiosInstance.patch(endpoints.REPORTADDED.DeleteReport(reportId));
};


export const ReportShare = async (data: any) => {
  return axiosInstance.post(`${endpoints.REPORTADDED.ShareReport}`, data)
}

export const ReportEdit = async (reportId: number, payload: { reportName: string; accessUpdates: { independentUserId: number; accessStatus: boolean; }[]; }) => {
  return axiosInstance.patch(endpoints.REPORTADDED.EditReport(reportId), payload,
  );
};


// Medical History 

export const HistoryList = async (userId: number) => {
  return axiosInstance.get(`${endpoints.MEDICALHISTORY.MedicalList}/${userId}`)
}

export interface SurgeryFormData {
  surgeryName: string;
  hospitalName: string;
  drName: string;
  surgeryDate: string;
}
export const AddHistory = async (userId: number, formData: SurgeryFormData) => {
  return axiosInstance.post(
    endpoints.MEDICALHISTORY.AddMedical(userId),
    formData,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
};

interface EditPayload {
  surgeryName: string;
  hospitalName: string;
  drName: string;
  surgeryDate: string; 
}
export const HistoryEdit = async (userId: number, data: EditPayload) => {
  return axiosInstance.patch(`${endpoints.MEDICALHISTORY.EditMedical}/${userId}`, data)
}

export const DeleteData = async (id: number) => {
  return axiosInstance.delete(`${endpoints.MEDICALHISTORY.DeleteMedical}/${id}`)
}

export const ListHistory = async (userId: number) => {
  return axiosInstance.get(endpoints.MEDICALHISTORY.AllDataList(userId))
}

export const MetrixAdd = async (userId: number, formData: any) => {
  return axiosInstance.patch(endpoints.MEDICALHISTORY.AddMetrix(userId),
 formData,
)
}

export const SocialHistoryAdd = async (userId: number, formData: any) => {
  return axiosInstance.post(endpoints.MEDICALHISTORY.AddSocial(userId),
 formData,
)
}

export const AddAllergies = async (userId: number, formData: any) => {
  return axiosInstance.post(endpoints.MEDICALHISTORY.AdddynamicAllergies(userId),
 formData,
)
}

export const StaticAllergies = async (userId: number, formData: any) => {
  return axiosInstance.post(endpoints.MEDICALHISTORY.AddStaticAllergies(userId),
 formData,
)
}

export const AddedDisease = async (userId: number, formData: any) => {
  return axiosInstance.post(endpoints.MEDICALHISTORY.AdddynamicDesease(userId),
 formData,
)
}

export const UpdateDesease = async (userId: number, formData: any) => {
  return axiosInstance.post(endpoints.MEDICALHISTORY.DiseaseUpdate(userId),
 formData,
)
}

export const GeneratePdf = async (userId: number) => {
  return axiosInstance.get(endpoints.MEDICALHISTORY.PDFGet(userId), {
    responseType: 'blob', 
  });
};


export const AllergyEdit = async (
  userId: number,
  dynamicAllergyId: number,
  formData: any
) => {
  const url = endpoints.MEDICALHISTORY.EditAllergy(userId, dynamicAllergyId);
  return axiosInstance.put(url, formData);
};

// Allergy Delete API
export const AllergyDelete = async (userId: number, dynamicAllergyId: number) => {
  const url = endpoints.MEDICALHISTORY.DeleteAllergy(userId, dynamicAllergyId);
  return axiosInstance.delete(url);
};

// Disease Edit API
export const DiseaseEdit = async (
  userId: number,
  diseaseTypeId: number,
  formData: any
) => {
  const url = endpoints.MEDICALHISTORY.EditDesease(userId, diseaseTypeId);
  return axiosInstance.put(url, formData);
};

// Disease Delete API
export const DiseaseDelete = async (userId: number, diseaseTypeId: number) => {
  const url = endpoints.MEDICALHISTORY.DeleteDesease(userId, diseaseTypeId);
  return axiosInstance.delete(url);
};

/// MY members page

export const GetRequestList = async (userId: number) => {
  return axiosInstance.get(endpoints.REQUESTS.ListRequests(userId));
};

export const RespondToRequest = async (data: { requestId: number; status: 'accept' | 'reject' }) => {
  const actionMap: Record<'accept' | 'reject', 'Accepted' | 'Rejected'> = {
    accept: 'Accepted',
    reject: 'Rejected',  // Fixed: Changed from 'rejected' to 'Rejected'
  };

  const payload = {
    requestId: data.requestId,
    action: actionMap[data.status],
  };

  return axiosInstance.post(endpoints.REQUESTS.RESPOND_REQUEST, payload);
};

export const SoftDeleteMember = async (id: number) => {
  const url = endpoints.REQUESTS.DeleteMember(id);
  return axiosInstance.put(url);
};


export const EditMember = async (memberId: number, data: FormData) => {
  return axiosInstance.patch(endpoints.REQUESTS.EditMember(memberId), data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};



// Suscripation 

export const CreateData = async (payload: any) => {
  return axiosInstance.post(endpoints.SUBSCRIPATION.Create_Order, payload);
}

export const Verify = async (payload: any) => {
  return axiosInstance.post(endpoints.SUBSCRIPATION.Verify_Payment, payload);
}

export const QuerySubmit = async (payload: any) => {
  return axiosInstance.post(endpoints.SUBSCRIPATION.Submit_Query, payload);
}

// Folder 


export const FolderCreate = async (payload:any) =>{
return axiosInstance.post(`${endpoints.FOLDER.CreateFolder}`, payload)
}

export const FolderList = async (userId: number, include: number[] = []) => {
  return axiosInstance.get(`${endpoints.FOLDER.ListFolder(userId)}`, {
    params: {
      include: include,
    },
  });
};
export const FolderEdit = async (id: any, payload: { folderName: string }) => {
    return axiosInstance.put(`${endpoints.FOLDER.EditFolder}/${id}`, payload);
}

export const FolderDelete = async (id: any) => {
    return axiosInstance.delete(`${endpoints.FOLDER.EditFolder}/${id}`);
}


export const UploadeBatch = async (userId: number, folderId: number, formData: FormData) => {
  return axiosInstance.post(
    endpoints.FOLDER.UploadBatch(userId, folderId),
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );
};


export const ListData = async (
  userId: number,
  folderId: number,
  reportCategory?: number 
) => {
  const endpoint = endpoints.FOLDER.GetReports(userId, folderId);

  const params = reportCategory !== undefined ? { reportCategory } : {};

  return axiosInstance.get(endpoint, { params });
};

export const ReportDelete = async (userId:number , reportId:number) =>{
  return axiosInstance.delete(endpoints.FOLDER.DeleteReport(userId,reportId))
}

export const Reportedit = async (userId: number, reportId: number, payload: { reportName: string, editDate: string }) => {
  return axiosInstance.patch(endpoints.FOLDER.EditReport(userId, reportId), payload)
}


export const FolderAccess = async (userId:number, payload:any) =>{
return axiosInstance.post(`${endpoints.FOLDER.AccessFolder}/${userId}`, payload)
}

export const FolderShare = async (data: any) => {
  return axiosInstance.post(`${endpoints.FOLDER.ShareFolder}`, data)
}

// Forgot password 

// api/auth.ts or similar
export const SendOtpForgot = async (payload: { email: string }) => {
  return axios.post(`${endpoints.FORGOT_PASSWORD.ForgotOtpSend}`, payload);
};


export const PasswordForgot = async (payload:any) => {
  return axios.post(`${endpoints.FORGOT_PASSWORD.Password_forgot}`, payload);
};

export const PasswordChange = async (payload:any) => {
  return axiosInstance.post(`${endpoints.FORGOT_PASSWORD.Change_Password}`, payload);
};


//Family Prescription 

export const GetFmailyData = async (userId:number ) =>{
  return axiosInstance.get(endpoints.FAMILYPRESCRIPATION.ListFamilyData(userId))
}

export const LIstAllData = async (userId:number) => {
  return axiosInstance.get(`${endpoints.FAMILYPRESCRIPATION.AllDataList}/${userId}`);
}

export const FamilyMemberAdded = async (payload:any) =>{
return axiosInstance.post(`${endpoints.FAMILYPRESCRIPATION.AddFamilyMember}`, payload)
}

export const FamilyMemberEdit = async (prescriptionId :number , payload:any) =>{
return axiosInstance.put(`${endpoints.FAMILYPRESCRIPATION.EditFamilyMember}/${prescriptionId}`, payload)
}

export const FamilyMemberDelete = async (prescriptionId:number) =>{
  return axiosInstance.delete(`${endpoints.FAMILYPRESCRIPATION.DeleteFamilyMember}/${prescriptionId}`)
}

export const FamilyShare = async (data: any) => {
  return axiosInstance.post(`${endpoints.FAMILYPRESCRIPATION.ShareFmailyData}`, data)
}


//Immunations 

export const ImmunationAdd = async (payload:any) =>{
  return axiosInstance.post(`${endpoints.IMMUNIZATION.AddImmunization}`,payload)
}

export const DataImmunaztion =async (userId:number) =>{
  return axiosInstance.get(`${endpoints.IMMUNIZATION.ListDatImmunization(userId)}`)
}

export const ImmunatiomnEdit = async (id:number , payload:any) =>{
  return axiosInstance.put(`${endpoints.IMMUNIZATION.EditImmunization}/${id}`,payload)
}

export const ImmunatiomnDelete = async (id:number) =>{
  return axiosInstance.delete(`${endpoints.IMMUNIZATION.DeleteImmunization}/${id}`)
}

// Feed Back 


export const FeedBackAdd = async (userId: number, payload: { feedback: string }) => {
  return axiosInstance.post(endpoints.FEEDBACk.AddFeedBack(userId), payload)
}