import { isDevMode } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { DEV_PROD } from "./constents";
import { IMAGE, INSTITUTION, INTEREST_KEYWORD, USER_OBJ, USER_PREFERENCE, VUE } from "./models";

export function placeholderImage(width:string, height:string){
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'%3E%3C/svg%3E`
}

export function composedPath (el) {

  var path = [];

  while (el) {

    path.push(el);

    if (el.tagName === 'HTML') {

      path.push(document);
      path.push(window);

      return path;
    }

    el = el.parentElement;
  }
}

export function removeValidators(form: FormGroup) {
  for (const key in form.controls) {
      form.get(key).clearValidators();
      form.get(key).updateValueAndValidity();
  }
}

export function truncate(str:string,charLength:number){
  let length = charLength;
  let ending = '...';

  if (str != null){
    if (str.length > length) {
      return str.substring(0, length - ending.length) + ending;
    }
    else {
      return str;
    }
  }
  else{
    return '';
  }
}

export function timeSince(date:Date) {

  var seconds = Math.floor((new Date().valueOf() - date.valueOf()) / 1000);

  var interval = seconds / 31536000;
  if (interval > 1) {
    if (Math.floor(interval) == 1){
      return "a year ago";
    }
    return Math.floor(interval) + " years ago";
  }

  interval = seconds / 2592000;
  if (interval > 1) {
    if (Math.floor(interval) == 1){
      return "a month ago";
    }
    return Math.floor(interval) + " months ago";
  }

  interval = seconds / 86400;
  if (interval > 1) {
    if (Math.floor(interval) == 1){
      return "a day ago";
    }
    return Math.floor(interval) + " days ago";
  }

  interval = seconds / 3600;
  if (interval > 1) {
    if (Math.floor(interval) == 1){
      return "a hour ago";
    }
    return Math.floor(interval) + " hours ago";
  }

  interval = seconds / 60;
  if (interval > 1) {
    if (Math.floor(interval) == 1){
      return "a minute ago";
    }
    return Math.floor(interval) + " minutes ago";
  }

  return " just now";
}

export function locationName(user_preference:USER_PREFERENCE, author_preference:USER_PREFERENCE){
  if (user_preference.country === author_preference.country){
    return `${author_preference.region}, ${user_preference.country_code}`;
  }
  else{
    return author_preference.country;
  }
}

export function modifyDateByDay(date:Date, days:number, add=false){
  let modifiedDate;
  if (add){
    modifiedDate = date.setDate(date.getDate() + days);
  }
  else{
    modifiedDate = date.setDate(date.getDate() - days);
  }

  return modifiedDate
}

export function isVueConverseDisable(user_preference:USER_PREFERENCE, author_preference:USER_PREFERENCE): boolean{
  let locationCheckPassed = false
  let ageCheckPassed = false
  let conversationCheckPassed = false

  let user_conversation_point:number;
  let author_conversation_point:number;


  if (author_preference.locationPreference === 'COUNTRY'){
    author_preference.country === user_preference.country ? locationCheckPassed = true : null;
  }
  else if (author_preference.locationPreference === 'REGION'){
    author_preference.region === user_preference.region && author_preference.country === user_preference.country ? locationCheckPassed = true : null;
  }
  else if (author_preference.locationPreference === 'INSTITUTION'){
    if (user_preference.institution != null){
      if (author_preference.institution.uid === user_preference.institution.uid && user_preference.institution.verified){
        locationCheckPassed = true;
      }
    }
  }
  else{
    locationCheckPassed = true;
  }

  if (
      user_preference.age >= (author_preference.age-author_preference.agePreference) &&
      user_preference.age <= (author_preference.age+author_preference.agePreference)
    ){
      ageCheckPassed = true;
  }


  if (user_preference.conversationPoints >= 100){
    user_conversation_point = 100;
  }
  else{
    user_conversation_point = user_preference.conversationPoints;
  }

  if (author_preference.conversationPoints >= 100){
    author_conversation_point = 100;
  }
  else{
    author_conversation_point = author_preference.conversationPoints;
  }

  if (user_conversation_point > author_conversation_point){
    if (author_conversation_point >= 30){
      conversationCheckPassed = true;
    }
  }
  else if (author_conversation_point > user_conversation_point){
    if (author_conversation_point-user_conversation_point <= 10){
      conversationCheckPassed = true;
    }
  }
  else{
    conversationCheckPassed = true;
  }


  
  if (locationCheckPassed && ageCheckPassed && conversationCheckPassed){
    return false;
  }
  else{
    return true;
  }
}

export function createUserObj(user){
    const userObj:USER_OBJ = {
        student_profile_id: user.studentprofile.id,
        uid: user.uid,
        email: user.email,
        username: user.username,
        fullName: user.firstName,
        nickname: user.studentprofile.nickname,
        sex: (user.sex).toLowerCase(),
        dob: user.dob,
        age: user.age,
        profilePicture: user.profilePicture != null ? {
            id: user.profilePicture.id,
            image: isDevMode() ? DEV_PROD.httpServerUrl_dev +'static/'+ user.profilePicture.image : user.profilePicture.imageUrl,
            thumnail: isDevMode() ? DEV_PROD.httpServerUrl_dev +'static/'+ user.profilePicture.thumnail : user.profilePicture.thumnailUrl,
            width: user.profilePicture.width,
            height: user.profilePicture.height
        } : null,
        institution: user.studentprofile.studentinstitution != null ? createInstitution(user.studentprofile.studentinstitution.institution, user.studentprofile.studentinstitution.verified) : null,
        location: {
            postal_code: user.location.code === 0 ? null : user.location.code,
            region: user.location.region.name,
            state_or_province: user.location.region.stateOrProvince.name,
            country_code: user.location.region.stateOrProvince.country.code,
            country_name: user.location.region.stateOrProvince.country.name
        },
        locationPreference: user.studentprofile.locationPreference.toLowerCase(),
        agePreference: Number(user.studentprofile.agePreference),
        conversationPoints: Number(user.studentprofile.conversationPoints),
        newConversationDisabled: user.studentprofile.newConversationDisabled,
        newConversationCount: Number(user.studentprofile.newConversationCount),
        newConversationTime: user.studentprofile.newConversationTime != null ? new Date(user.studentprofile.newConversationTime) : null
    }

    return userObj;
}

export function createStudentInterest(studentInterestArray){
    const studentInterests:INTEREST_KEYWORD[] = [];

    studentInterestArray.forEach(element => {
        studentInterests.push({
          id: element.node.interest.id,
          name: element.node.interest.word,
          selected: false,
          saved: element.node.saved,
          count: element.node.count,
          average_percent: element.node.averagePercentage
        });
    });

    return studentInterests;
}

export function createInstitution(institutionObj, verified){
    const institution:INSTITUTION = {
      uid: institutionObj.uid,
      name: institutionObj.name,
      abbreviation: institutionObj.abbreviation,
      email_domain: institutionObj.emailDomain,
      verified: verified,
  
      location: institutionObj.location != null ? {
        postal_code: null,
        region:{name: institutionObj.location.region.name},
        coordinate: null,
        state: null,
        country_code: institutionObj.location.region.stateOrProvince.country.code
      } : null,
  
      logo: institutionObj.logo != null ? {
        id: institutionObj.logo.id,
        image: isDevMode() ? DEV_PROD.httpServerUrl_dev +'static/'+ institutionObj.logo.image : institutionObj.logo.imageUrl,
        thumnail: isDevMode() ? DEV_PROD.httpServerUrl_dev +'static/'+ institutionObj.logo.thumnail : institutionObj.logo.thumnailUrl,
        width: institutionObj.logo.width,
        height: institutionObj.logo.height
      } : null
    }
  
    return institution;
}

export function createVueObj(vueObj, userObj): VUE{
  const userPreference:USER_PREFERENCE = {
    country: userObj.location.country_name,
    country_code: userObj.location.country_code,
    region: userObj.location.region,
    institution:userObj.institution != null ? {
      uid: userObj.institution.uid, 
      verified: userObj.institution.verified
    } : null,
    locationPreference: userObj.locationPreference,
    agePreference: userObj.agePreference,
    conversationPoints: userObj.conversationPoints,
    age: userObj.age
  }

  const author_preference:USER_PREFERENCE = {
    country: vueObj.author.country,
    region: vueObj.author.region,
    institution: vueObj.author.studentinstitution != null ? {
      verified: vueObj.author.studentinstitution.verified,
      uid: vueObj.author.studentinstitution.institution.uid
    } : null,
    locationPreference: vueObj.author.locationPreference,
    conversationPoints: vueObj.author.conversationPoints,
    agePreference: vueObj.author.agePreference,
    age: vueObj.author.age,
    newConversationDisabled: vueObj.author.newConversationDisabled,
    autoConversationDisabled: vueObj.author.autoConversationDisabled
  }

  const conversation_started = false;
  const vue_interest_tags:INTEREST_KEYWORD[] = [];

  let conversation_disabled = false;
  let image:IMAGE = null;

  if (vueObj.image != null){
    image = {
      id: vueObj.image.id,
      image: vueObj.image.image,
      thumnail: isDevMode() ? DEV_PROD.httpServerUrl_dev +'static/'+ vueObj.image.thumnail : vueObj.image.thumnailUrl,
      width: vueObj.image.width,
      height: vueObj.image.height
    }
  }

  vueObj.vueinterestSet.edges.forEach(interest => {
    vue_interest_tags.push({
      id: interest.node.interestKeyword.id,
      name: interest.node.interestKeyword.word
    });
  });

  if (vueObj.conversationDisabled || author_preference.newConversationDisabled || author_preference.autoConversationDisabled || conversation_started){
    conversation_disabled = true;
  }
  else{
    conversation_disabled = isVueConverseDisable(userPreference, author_preference);
  }

  const vue:VUE = {
    id: vueObj.id,
    image: image,
    title: vueObj.title,
    url: vueObj.url,
    domain_name: vueObj.domain?.domainName,
    site_name: vueObj.domain?.siteName,
    description: vueObj.description,
    interest_keyword: vue_interest_tags,
    created: vueObj.create,
    friendly_date: timeSince(new Date(vueObj.create)),
    author_id: vueObj.author.id,
    location: locationName(userPreference, author_preference),
    age: vueObj.author.age,
    active: new Date(vueObj.author.lastSeen) > modifyDateByDay(new Date, 10) ? true : false,
    conversation_disabled: conversation_disabled,
    conversation_started: conversation_started,
    special: false,
    user_opened: false,
    user_saved: false,
    cursor: null
  }

  return vue;
}