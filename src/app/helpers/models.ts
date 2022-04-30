export interface USER_OBJ{
    student_profile_id:string,
    uid:string,
    email:string,
    username:string,
    fullName:string,
    nickname:string,
    sex:string,
    dob:string,
    age:number,
    profilePicture:IMAGE,
    institution:INSTITUTION,
    location:LOCATION,

    locationPreference:string,
    agePreference:number,

    conversationPoints:number,
    newConversationDisabled:boolean,
    newConversationTime:Date,
    newConversationCount:number
}

export interface USER_PREFERENCE{
    country?:string,
    country_code?:string,
    region?:string,
    institution?:INSTITUTION,
    locationPreference?:string,
    conversationPoints?:number,
    agePreference?:number,
    age?:number,
    newConversationDisabled?:boolean,
    autoConversationDisabled?:boolean
}

export interface COORDINATE{
    latitude:string,
    longitude:string,
}

export interface LOCATION{
    postal_code:number,
    region:string,
    state_or_province:string,
    country_name?:string,
    country_code?:string
}

export interface INSTITUTION{
    uid:string,
    name?:string,
    abbreviation?:string,
    email_domain?:string,
    location?:LOCATION_JSON,
    logo?:IMAGE,
    verified:boolean
}

export interface REGION{
    name:string,
    city?:boolean,
    town?:boolean,
    village?:boolean,
    hamlet?:boolean,
    unknown?:boolean
}

export interface LOCATION_JSON{
    postal_code?:string,
    region:REGION,
    coordinate:COORDINATE,
    state:string,
    country_code:string
}

export interface INTEREST_KEYWORD{
    id:string,
    name:string,
    selected?:boolean,
    saved?:boolean,
    count?:number,
    average_percent?:number
}

export interface INTEREST_CATEGORY{
    name:string,
    interest_keyword:INTEREST_KEYWORD[]
}

export interface IMAGE{
    id?:string,
    image?:string,
    thumnail?:string,
    width?:string,
    height?:string,
}

export interface setDataParems{
    accessToken?:string,
    refreshToken?:string,
    userObject?:USER_OBJ,
    interestCategory?:string
}

export interface getUserData{
    trustedDevice?:boolean,
    accessToken?:string,
    refreshToken?:string,
    userObject?:USER_OBJ,
    interestCategory?:INTEREST_CATEGORY[]
}

export interface getDataParems{
    trustedDevice?:boolean,
    accessToken?:boolean,
    refreshToken?:boolean,
    userObject?:boolean,
    interestCategory?:boolean
}

export interface VUE{
    vue_feed_id?:string,
    id?:string,
    image?:IMAGE,
    title?:string,
    url?:string,
    domain_url?:string,
    site_name?:string,
    domain_name?:string,
    description?:string,
    interest_keyword?:INTEREST_KEYWORD[],
    created?:string,
    friendly_date?:string,
    viewed?:number,
    saved?:number
    cursor?:string,
    author_id?:string,
    location?:string,
    age?:number,
    active?:boolean,
    conversation_disabled?:boolean,
    conversation_started?:boolean,
    public?:boolean,
    user_opened?:boolean,
    user_saved?:boolean,
    user_disliked?:boolean,
    user_reported?:boolean,
    special?:boolean
}

export interface VUE_FEED_IDS{
    id:string,
    special:boolean
}

export interface VUE_FEED_UPDATED{
    vue_id:string,
    opened:boolean,
    saved:boolean,
    conversation_started:boolean
}

export interface IMG_RESOURCE{
    original_url:string,
    local_url:string
}

export interface REPORT{
    misleading:boolean,
    clickbait:boolean,
    adult:boolean,
    shopping:boolean,
    gambling:boolean,
    dangerous:boolean,
    other:boolean
}