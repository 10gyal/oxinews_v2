import { supabase } from "@/lib/supabase";
import axios from "axios";

export interface PipelineFormData {
  pipeline_name: string;
  focus: string;
  schedule: string;
  delivery_time: string;
  is_active: boolean;
  delivery_email: string[] | null;
  subreddits: string[] | null;
  source: string[] | null;
}

export interface PipelineData extends PipelineFormData {
  id: string; // UUID in the database
  user_id: string;
  pipeline_id: string;
  created_at: string;
  updated_at?: string;
  delivery_count?: number;
}

export interface PipelineError {
  message: string;
  code?: string;
}

/**
 * Sends a webhook notification for the first article
 * @param pipelineId The pipeline ID to include as a request parameter
 */
const notifyFirstArticle = async (pipelineId: string) => {
  try {
    await axios.get("https://primary-production-8265.up.railway.app/webhook/first_article", {
      params: {
        pipeline_id: pipelineId
      }
    });
  } catch (error) {
    console.error("Error sending first article webhook notification:", error);
  }
};

/**
 * Creates a new pipeline in the database
 * @param userId The user ID
 * @param data The pipeline form data
 * @returns The created pipeline data or an error
 */
export const createPipeline = async (
  userId: string,
  data: PipelineFormData
): Promise<{ data?: PipelineData[]; error?: PipelineError }> => {
  try {
    // Generate a unique pipeline_id from the name
    const timestamp = new Date().getTime().toString().slice(-6);
    const pipelineId = `${data.pipeline_name.toLowerCase().replace(/\s+/g, "-")}-${timestamp}`;
    
    // Convert source values to lowercase if they exist
    const lowercasedSource = data.source ? data.source.map(src => src.toLowerCase()) : null;
    
    const pipelineData = {
      user_id: userId,
      pipeline_id: pipelineId,
      ...data,
      source: lowercasedSource, // Use lowercased source values
      delivery_time: `${data.delivery_time}:00`, // Add seconds to match time format
    };
    
    const { data: result, error: supabaseError } = await supabase
      .from('pipeline_configs')
      .insert(pipelineData)
      .select();
    
    if (supabaseError) {
      console.error("Supabase error:", supabaseError);
      
      // Handle specific error cases
      if (supabaseError.code === '23505') { // Unique constraint violation
        return { error: { message: "A pipeline with this name already exists. Please choose a different name.", code: supabaseError.code } };
      } else if (supabaseError.code === '23514') { // Check constraint violation
        return { error: { message: "Invalid data format. Please check your inputs and try again.", code: supabaseError.code } };
      } else {
        return { error: { message: `Database error: ${supabaseError.message}`, code: supabaseError.code } };
      }
    }
    
    // If pipeline was created successfully, check if this is the first pipeline (delivery_count = 0)
    // and send webhook notification
    if (result && result.length > 0) {
      const { data: pipelineData } = await supabase
        .from('pipeline_configs')
        .select('delivery_count')
        .eq('id', result[0].id)
        .single();
      
      if (pipelineData && pipelineData.delivery_count === 0) {
        // Use the pipelineId we generated at the beginning of the function
        // This ensures we have the pipeline_id even before the user submits the form
        await notifyFirstArticle(pipelineId);
      }
    }
    
    return { data: result };
  } catch (err: unknown) {
    console.error("Error creating pipeline:", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to create pipeline";
    return { error: { message: errorMessage } };
  }
};

/**
 * Updates an existing pipeline in the database
 * @param userId The user ID
 * @param pipelineId The pipeline ID
 * @param data The pipeline form data
 * @returns The updated pipeline data or an error
 */
export const updatePipeline = async (
  userId: string,
  pipelineId: string,
  data: PipelineFormData
): Promise<{ data?: PipelineData[]; error?: PipelineError }> => {
  try {
    // Convert source values to lowercase if they exist
    const lowercasedSource = data.source ? data.source.map(src => src.toLowerCase()) : null;
    
    const pipelineData = {
      ...data,
      source: lowercasedSource, // Use lowercased source values
      delivery_time: `${data.delivery_time}:00`, // Add seconds to match time format
      updated_at: new Date().toISOString()
    };
    
    // First try to update by id (UUID)
    const { data: result, error: supabaseError } = await supabase
      .from('pipeline_configs')
      .update(pipelineData)
      .eq('id', pipelineId) // Use id field (UUID)
      .eq('user_id', userId)
      .select();
    
    if (supabaseError) {
      console.error("Supabase error:", supabaseError);
      
      // Handle specific error cases
      if (supabaseError.code === '23514') { // Check constraint violation
        return { error: { message: "Invalid data format. Please check your inputs and try again.", code: supabaseError.code } };
      } else {
        return { error: { message: `Database error: ${supabaseError.message}`, code: supabaseError.code } };
      }
    }
    
    // If pipeline was updated successfully, check if delivery_count is 0
    // and send webhook notification
    if (result && result.length > 0) {
      const { data: pipelineData } = await supabase
        .from('pipeline_configs')
        .select('delivery_count')
        .eq('id', pipelineId) // Use id field (UUID)
        .single();
      
      if (pipelineData && pipelineData.delivery_count === 0) {
        await notifyFirstArticle(pipelineId);
      }
    }
    
    return { data: result };
  } catch (err: unknown) {
    console.error("Error updating pipeline:", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to update pipeline";
    return { error: { message: errorMessage } };
  }
};

/**
 * Fetches a pipeline by ID
 * @param userId The user ID
 * @param pipelineId The pipeline ID
 * @returns The pipeline data or an error
 */
export const fetchPipeline = async (
  userId: string,
  pipelineId: string
): Promise<{ data?: PipelineData; error?: PipelineError }> => {
  try {
    // First try to find by pipeline_id
    let { data, error } = await supabase
      .from('pipeline_configs')
      .select('*')
      .eq('pipeline_id', pipelineId)
      .eq('user_id', userId);
    
    // If no results or error, try to find by id (UUID)
    if (error || !data || data.length === 0) {
      const { data: idData, error: idError } = await supabase
        .from('pipeline_configs')
        .select('*')
        .eq('id', pipelineId)
        .eq('user_id', userId);
      
      data = idData;
      error = idError;
    }
    
    // Handle case where multiple or no rows are returned
    if (error) {
    
      return { error: { message: error.message, code: error.code } };
    }
    
    if (!data || data.length === 0) {
      return { error: { message: "Pipeline not found" } };
    }
    
    // Return the first matching pipeline
    return { data: data[0] };
  } catch (err: unknown) {
    console.error("Error fetching pipeline:", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to fetch pipeline";
    return { error: { message: errorMessage } };
  }
};
