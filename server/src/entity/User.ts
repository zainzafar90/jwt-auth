import { ObjectType, Field } from "type-graphql";
import { Entity, ObjectIdColumn, ObjectID, Column, BaseEntity } from "typeorm";

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
