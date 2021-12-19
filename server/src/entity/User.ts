import { ObjectType, Field } from "type-graphql";
import { Entity, ObjectIdColumn, Column, BaseEntity, ObjectID } from "typeorm";

@ObjectType()
@Entity("users")
export class User extends BaseEntity {
  @Field(() => String)
  @ObjectIdColumn()
  id: ObjectID;

  @Field(() => String)
  @Column("text")
  email: string;

  @Column("text")
  password: string;
}
