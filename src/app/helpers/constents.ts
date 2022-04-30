export const TRUSTED_DEVICE = 'trusted_device';
export const ACCESS_TOKEN = 'access_token';
export const REFRESH_TOKEN = 'refresh_token';
export const USER_OBJECT = 'user_object';
export const STUDENT_STATE='student_state';
export const INTEREST_CATEGORY_OBJECT = 'interest_category_object';

export const REGEX = {
    alphabet_validation: /^[a-zA-Z ]*$/,
    number_validation: /^[0-9]*$/,
    password_validation: /^(?=.*\d)(?=.*[a-z])(?=.*[!@#$%^&*]).{8,}$/,
    email_validation: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
    username_validation: /^[_A-z0-9]*((-|)*[_A-z0-9])*$/
}

export const ERROR_MESSAGE = {
    unknown_error: 'Something went wrong, Retry!',
    login_error: 'Failed to Login, Retry!',
    interest_selection_error: 'Only 3 interest can be selected at once',
    interest_saved: 'Your interests are saved'
}

export const LOCATION_PREFERENCE = {
    global: 'global',
    country: 'country',
    region: 'region',
    institution: 'institution'
}

export const IMG_LOAD = {
    placeholder: 'placeholder',
    thumnail: 'thumnail',
    img: 'img'
}

//export const CORS_PROXY_URL = 'https://cors-anywhere.herokuapp.com/'
//export const CORS_PROXY_URL = 'http://192.168.0.107:8000/proxy/'
export const CORS_PROXY_URL = 'https://api.allorigins.win/raw?url='


/*
export const DEV_PROD = {
    httpServerUrl_dev: "http://192.168.0.107:8000/",
    httpServerUrl_prod: "https://we.pinekown.com/",
    wsServerUrl_dev: "ws://192.168.0.107:8000/",
    wsServerUrl_prod: "wss://we.pinekown.com:8001/",
    staticUrl_prod: "https://sgp1.digitaloceanspaces.com/wave-static/wave-static/frontend/"
}
*/
export const DEV_PROD = {
    httpServerUrl_dev: "http://192.168.0.107:8000/",
    httpServerUrl_prod: "http://192.168.0.107:8000/",
    wsServerUrl_dev: "ws://192.168.0.107:8000/",
    wsServerUrl_prod: "ws://192.168.0.107:8000/",
    staticUrl_prod: "https://sgp1.digitaloceanspaces.com/wave-static/wave-static/frontend/"
}