import axios from "axios";

export async function getCsrfToken() {
    try {
        await axios.get('http://localhost:8000/sanctum/csrf-cookie',{
            withCredentials:true
        })
        const xsrfToken = document.cookie
        .split('; ')
        .find(cookie=>cookie.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];
        console.log(xsrfToken)
        if(!xsrfToken){
            console.error('XSRF-TOKEN not found in cookies');
            return null;
        }
        return decodeURIComponent(xsrfToken);
    } catch (error) {
        console.error('Error fetching CSRF token:', error);
        return null;
    }
}