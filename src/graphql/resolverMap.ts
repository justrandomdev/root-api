import { IResolvers } from '@graphql-tools/utils'
import { merge } from  'lodash'
import { UserResolvers } from './resolvers/UserResolver'

//Merge resolvers into 1
const resolverMap: IResolvers = merge(UserResolvers)
export default resolverMap