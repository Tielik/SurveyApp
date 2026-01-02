export const getAuthToken = () => localStorage.getItem("token")

export const hasAuthToken = () => Boolean(getAuthToken())
