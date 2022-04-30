import { GraphqlService } from "../services/graphql.service";
import { UserDataService } from "../services/user-data.service";


export function appInitializer(graphqlService: GraphqlService, userDataService: UserDataService){
    return async () =>{
      const userData = await userDataService.getItem({trustedDevice: true});
      if (userData.trustedDevice){
        graphqlService.initialTokenRefresh = true;
        graphqlService.getNewToken();
      }
    }
}