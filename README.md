## Root API assessment

### Overview

For this assessment I built a very basic GraphQL API using Nodejs,  TypeScript and Redis as a key-value store. 
It allows a user to register and login. Other common options are REST and a less common option is gRPC. gRPC can be more efficient but the client and server are tightly coupled due to shared type definitions.   

### Why GraphQL?

GraphQL brings a few benefits over REST including:
- The ability to request the exact payload you want, it doesn't under or over fetch
- Data enrichment or fetching from multiple endpoints using REST results in multiple calls from teh front end. With GraphQL the full payload is resolved on the server side, even if its from multiple sources.
- GraphQL has nice introspection and documentation capabilites

### API usage
Install docker<br/>
Install docker-compose<br/>
run ```docker-compose up```<br/>
When the app is running(You will see a message "GraphQL is running on http://0.0.0.0:4000/graphql") go to http://localhost:4000/graphql<br/>
*Note: It does take a while for the server to start because its running an npm install in the background*
Click on "Query your server"

This query will check credentials(admin@example.com has been pre loaded). If the login fails the message will be "Go away!".
```
query login {
  login(email: "admin@example.com", password: "admin") {
    message
  }
}
```

This mutation will register a user
```
mutation reg {
  register(email: "test@example.com", password: "test") {
    message
  }
}
```

*Note: 
Version number's are not pinned in the package.json file. I would normally do this to make sure that pipelines dont break when packages update with breaking changes.
TLS not used = bad, bad, boy!
Input validation rules are missing too. Eek!*
