import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class PingResult extends Document {
  @Prop({ type: String, required: true, index: true })
  monitorId!: string;

  @Prop({ type: Number, default: null })
  statusCode!: number | null;

  @Prop({ type: Boolean, required: true })
  isUp!: boolean;

  @Prop({ type: Number, required: true })
  responseTimeMs!: number;

  @Prop({ type: String, default: null })
  error!: string | null;

  @Prop({ type: Date, required: true, index: true })
  checkedAt!: Date;
}

export const PingResultSchema = SchemaFactory.createForClass(PingResult);
PingResultSchema.index({ monitorId: 1, checkedAt: -1 });
