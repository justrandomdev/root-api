import { IResolvers } from '@graphql-tools/utils';
import { AuthResponse, MutationRegisterArgs, QueryLoginArgs } from '../generated'

export const UserResolvers: IResolvers = {
    Query: {
        async login (_: void, args: QueryLoginArgs, context: any): Promise<AuthResponse> {
          let result = "Go away!";

          //Get credentials
          let value = await context.redisClient.get(`username:${args.email}`)
          console.log(`Value fetched from redis ${value}`);
          console.log(`args.password ${args.password}`);

          if (args.password === value)
            result = "Authenticated"

          return {
              message: result
          }
        }
    }, 
    Mutation: {
        async register (_: void, args: MutationRegisterArgs, context: any): Promise<AuthResponse> {

          //Add credentials
          try {
            await context.redisClient.set(`username:${args.email}`, args.password)

            return {
              message: "Registration successful"
            }
          }
          catch(e) {
            return {
              message: e as string
            }
          }
        }
    }
}