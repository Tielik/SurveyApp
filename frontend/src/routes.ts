export const routes = {
  login: "/",
  register: "/register",
  dashboard: "/dashboard",
  surveyCreate: "/surveys/create",
  surveyEdit: (id: string | number = ":id") => `/surveys/${id}/edit`,
  surveyResults: (id: string | number = ":id") => `/surveys/${id}/results`,
  vote: (code: string = ":code") => `/vote/${code}`,
}
