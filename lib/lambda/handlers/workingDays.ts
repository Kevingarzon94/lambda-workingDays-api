import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { WorkingDaysParams, SuccessResponse, ErrorResponse } from "../types";
import { validateParams } from '../utils/validators'
import { calculateWorkingDate } from '../services/dateCalculator'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {

    const params: WorkingDaysParams = {
      days: event.queryStringParameters?.days,
      hours: event.queryStringParameters?.hours,
      date: event.queryStringParameters?.date
    };
    const validatedParams = validateParams(params);
    const result = await calculateWorkingDate(validatedParams);

    const response: SuccessResponse = {
      date: result
    };

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(response)
    };

  } catch (error) {

    const errorResponse: ErrorResponse = {
      error: "InvalidParameters",
      message: error instanceof Error ? error.message : "Unknown error"
    };

    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(errorResponse)
    };

  }
};