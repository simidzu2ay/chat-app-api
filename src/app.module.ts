import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
import path from 'path';
import { GqlAuthGuard } from './auth/auth.guard';
import { AuthModule } from './auth/auth.module';
import { ChatsModule } from './chats/chats.module';
import configurationYaml from './config/configuration.yaml';
import { MessagesModule } from './messages/messages.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      debug: true,
      autoSchemaFile: path.join(__dirname, '..', 'schema.gql'),
      subscriptions: {
        'graphql-ws': true
      },

      context: context => {
        if (context?.extra?.request) {
          return {
            req: {
              ...context?.extra?.request,
              headers: {
                ...context?.extra?.request?.headers,
                ...context?.connectionParams?.headers
              }
            }
          };
        }

        return { req: context?.req };
      },
      cors: {
        origin: '*',
        credentials: true
      }
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      database: 'chat-app',
      synchronize: true,
      entities: ['dist/**/*.entity{.ts,.js}'],
      cache: true
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configurationYaml]
    }),
    UsersModule,
    MessagesModule,
    ChatsModule,
    AuthModule
  ],

  providers: [
    {
      provide: APP_GUARD,
      useClass: GqlAuthGuard
    }
  ]
})
export class AppModule {}
