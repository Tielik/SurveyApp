export const routes = {
  login: "/",
  register: "/register",
  dashboard: "/dashboard",
  surveyCreate: "/surveys/create",
  surveyEdit: (id: string | number = ":id") => `/surveys/${id}/edit`,
  vote: (code: string = ":code") => `/vote/${code}`,
}
