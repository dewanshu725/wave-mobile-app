import { gql } from 'apollo-angular';


// ----------------------------------------------------------- ACCOUNT -------------------------------------------
export const EMAIL_LOGIN_MUTATION = gql`
mutation login($email:String!, $password:String!){
    tokenAuth(input:{email:$email, password:$password}){
    token
    refreshToken
    errors
    user{
      uid
      email
      username
      firstName
      lastName
      sex
      dob
      age
      location{
        code
        region{
          name
          stateOrProvince{
            name
            country{
              name
              code
            }
          }
        }
      }
      profilePicture{
        id
        image
        imageUrl
        thumnail
        thumnailUrl
        width
        height
      }

      studentprofile{
        id
        nickname
        studentinstitution{
          verified
          institution{
            uid
            name
            abbreviation
            emailDomain
            location{
              region{
                name
                stateOrProvince{
                  country{
                    name
                    code
                  }
                }
              }
            }
            logo{
              id
              image
              imageUrl
              thumnail
              thumnailUrl
              width
              height
            }
          }
        }
        conversationPoints
        locationPreference
        agePreference
        state
        newConversationDisabled
        newConversationTime
        newConversationCount
        relatedstudentinterestkeywordSet{
          edges{
            node{
              interest{
                id
                word
              }
              saved
              count
              averagePercentage
            }
          }
        }
      }
    }
  }
}
`

export const USERNAME_LOGIN_MUTATION = gql`
mutation login($username:String!, $password:String!){
    tokenAuth(input:{username:$username, password:$password}){
    token
    refreshToken
    errors
    user{
      uid
      email
      username
      firstName
      lastName
      sex
      dob
      age
      location{
        code
        region{
          name
          stateOrProvince{
            name
            country{
              name
              code
            }
          }
        }
      }
      profilePicture{
        id
        image
        imageUrl
        thumnail
        thumnailUrl
        width
        height
      }
      studentprofile{
        id
        nickname
        studentinstitution{
          verified
          institution{
            uid
            name
            abbreviation
            emailDomain
            location{
              region{
                name
                stateOrProvince{
                  country{
                    name
                    code
                  }
                }
              }
            }
            logo{
              id
              image
              imageUrl
              thumnail
              thumnailUrl
              width
              height
            }
          }
        }
        conversationPoints
        locationPreference
        agePreference
        state
        newConversationDisabled
        newConversationTime
        newConversationCount
        relatedstudentinterestkeywordSet{
          edges{
            node{
              interest{
                id
                word
              }
              saved
              count
              averagePercentage
            }
          }
        }
      }
    }
  }
}
`

export const EMAIL_CHECK = gql`
mutation email($email:String!){
  emailUsernameCheck(input:{
    email:$email
  }){
    email
  }
}
`

export const USERNAME_CHECK = gql`
mutation username($username:String!){
  emailUsernameCheck(input:{
    username:$username
  }){
    username
  }
}
`

export const SEND_PASSWORD_RESET_OTP_FOR_USERNAME = gql`
mutation sendPasswordResetOtp($username: String){
  sendPasswordResetOtp(input:{
    username: $username
  }){
    key
  }
}
`

export const SEND_PASSWORD_RESET_OTP_FOR_EMAIL = gql`
mutation sendPasswordResetOtp($email: String){
  sendPasswordResetOtp(input:{
    email: $email
  }){
    key
  }
}
`

export const RESET_PASSSWORD = gql`
mutation passwordReset($key: String!, $verificationCode: Int!, $password: String!){
  passwordReset(input:{
    key: $key
    verificationCode: $verificationCode
    password: $password
  }){
    result
  }
}
`

export const ME_QUERY = gql`
query{
  me{
    uid
    email
    username
    firstName
    lastName
    sex
    dob
    age
    location{
      code
      region{
        name
        stateOrProvince{
          name
          country{
            name
            code
          }
        }
      }
    }
    profilePicture{
      id
      image
      imageUrl
      thumnail
      thumnailUrl
      width
      height
    }
    studentprofile{
      id
      nickname
      studentinstitution{
        verified
        institution{
          uid
          name
          abbreviation
          emailDomain
          location{
            region{
              name
              stateOrProvince{
                country{
                  name
                  code
                }
              }
            }
          }
          logo{
            id
            image
            imageUrl
            thumnail
            thumnailUrl
            width
            height
          }
        }
      }
      conversationPoints
      locationPreference
      agePreference
      state
      newConversationDisabled
      newConversationTime
      newConversationCount
      relatedstudentinterestkeywordSet{
        edges{
          node{
            interest{
              id
              word
            }
            saved
            count
            averagePercentage
          }
        }
      }
    }
  }
}
`

export const REFRESH_TOKEN_MUTATION = gql`
mutation Refresh_Token($refresh_token:String!){
    refreshToken(input:{
      refreshToken:$refresh_token
    }){
      success
      errors
      token
      refreshToken
    }
  }
`

export const USER_REGISTRATION = gql`
mutation user_registration(
  $username:String!,
  $email:String!,
  $password:String!,
  $gender:String!,
  $dob:String!,
  $fullname:String!,
  $nickname:String!,
  $interests:[ID]!
  $locationJson:String!,
){
  userRegistration(input:{
    username:$username
    email:$email
    password:$password
    fullname:$fullname
    nickname:$nickname
    gender:$gender
    dob:$dob
    interests:$interests
    locationJson:$locationJson
  }){
    result
  }
}
`


// ----------------------------------------------------------- INTEREST -------------------------------------------
export const ALL_INTEREST_CATEGORY = gql`
query{
  allInterestCategory{
    edges{
      node{
        name
        interestkeywordSet{
          edges{
            node{
              id
              word
            }
          }
        }
      }
    }
  }
}
`

export const STUDENT_INTEREST_SNAPSHOT = gql`
mutation{
  studentInterestSnapshot(input:{}){
    result
  }
}
`

export const INTEREST_KEYWORD_MUTATION = gql`
mutation save_interest($selectedInterests:[ID]!){
  interestKeywordMutation(input:{
    selectedInterests:$selectedInterests
  }){
    result
  }
}
`

// ------------------------------------------------------ VUE -------------------------------------------------------
export const GET_VUE_FEED_IDS = gql`
mutation vueFeedIds($locationPreference: String!){
  vueFeedIds(input:{
    locationPreference: $locationPreference
  }){
    recommendedVues
    vueFeed
  }
}
`

export const GET_VUE_FEED_FROM_IDS = gql`
mutation getVueFeedFromIds($vueFeedIds: [String]!){
  getVueFeedFromIds(input:{
    vueFeedIds: $vueFeedIds
  }){
    vueFeedObjs{
      id
      title
      description
      url
      create
      conversationDisabled
      image{
        id
        image
        thumnail
        thumnailUrl
        width
        height
      }
      author{
        id
        conversationPoints
        newConversationDisabled
        autoConversationDisabled
        locationPreference
        agePreference
        age
        lastSeen
        country
        region
        studentinstitution{
          verified
          institution{
            uid
          }
        }
      }
      domain{
        domainUrl
        domainName
        siteName
      }
      vueinterestSet{
        edges{
          node{
            interestKeyword{
              id
              word
            }
          }
        }
      }
    }
  }
}
`

export const VUE_HISTORY = gql`
query vue_history($first:Int, $after:String){
  vueOpened(first: $first, after: $after){
    pageInfo{
      hasNextPage
    }
    edges{
      cursor
      node{
        id
        saved
        special
        vue{
          id
          title
          description
          url
          create
          conversationDisabled
          image{
            id
            image
            thumnail
            thumnailUrl
            width
            height
          }
          author{
            id
            conversationPoints
            newConversationDisabled
            autoConversationDisabled
            locationPreference
            agePreference
            age
            lastSeen
            country
            region
            studentinstitution{
              verified
              institution{
                uid
              }
            }
          }
          domain{
            domainUrl
            domainName
            siteName
          }
          vueinterestSet{
            edges{
              node{
                interestKeyword{
                  id
                  word
                }
              }
            }
          }
        }
      }
    }
  }
}
`

export const VUE_SAVED = gql`
query vue_saved($first:Int, $after:String){
  vueSaved(first: $first, after: $after){
    pageInfo{
      hasNextPage
    }
    edges{
      cursor
      node{
        id
        opened
        special
        vue{
          id
          title
          description
          url
          create
          conversationDisabled
          image{
            id
            image
            thumnail
            thumnailUrl
            width
            height
          }
          author{
            id
            conversationPoints
            newConversationDisabled
            autoConversationDisabled
            locationPreference
            agePreference
            age
            lastSeen
            country
            region
            studentinstitution{
              verified
              institution{
                uid
              }
            }
          }
          domain{
            domainUrl
            domainName
            siteName
          }
          vueinterestSet{
            edges{
              node{
                interestKeyword{
                  id
                  word
                }
              }
            }
          }
        }
      }
    }
  }
}
`

export const VUE_SAVED_CURSOR = gql`
mutation vueSvedCursor($vueSavedId: ID!){
  vueSavedCursor(input:{
    vueSavedId: $vueSavedId
  }){
    cursor
  }
}
`

export const UPDATE_VUE_INTERACTION = gql`
mutation update_vue_interaction(
  $vueId: ID!,
  $opened: Boolean!,
  $saved: Boolean!,
  $special: Boolean!
){
  updateVueInteraction(input:{
    vueId: $vueId
    opened: $opened
    saved: $saved
    special: $special
  }){
    result
  }
}
`

export const REPORT_VUE = gql`
mutation report_vue(
  $vueId: ID!,
  $adultSite: Boolean!,
  $shoppingSite: Boolean!,
  $gamblingSite: Boolean!,
  $misleading: Boolean!,
  $clickbait: Boolean!,
  $dangerous: Boolean!,
  $others: Boolean!
){
  reportVue(input:{
    vueId: $vueId,
    adultSite: $adultSite,
    gamblingSite: $gamblingSite,
    shoppingSite: $shoppingSite,
    misleading: $misleading,
    dangerous: $dangerous,
    clickbait: $clickbait,
    others: $others
  }){
    result
  }
}
`

// ----------------------------------------------------------- OTHERS -------------------------------------------
export const GET_LOCATION_FROM_IP = gql`
mutation{
  getLocationFromIp(input:{}){
    latitude
    longitude
  }
}
`