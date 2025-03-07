import { supabase } from "@/lib/supabase";

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
  id: number;
  user_id: string;
  pipeline_id: string;
  created_at: string;
  updated_at?: string;
}

export interface PipelineError {
  message: string;
  code?: string;
}

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
    
    const pipelineData = {
      user_id: userId,
      pipeline_id: pipelineId,
      ...data,
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
    const pipelineData = {
      ...data,
      delivery_time: `${data.delivery_time}:00`, // Add seconds to match time format
      updated_at: new Date().toISOString()
    };
    
    const { data: result, error: supabaseError } = await supabase
      .from('pipeline_configs')
      .update(pipelineData)
      .eq('id', pipelineId)
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
    const { data, error } = await supabase
      .from('pipeline_configs')
      .select('*')
      .eq('id', pipelineId)
      .eq('user_id', userId)
      .single();
    
    if (error) {
      return { error: { message: error.message, code: error.code } };
    }
    
    if (!data) {
      return { error: { message: "Pipeline not found" } };
    }
    
    return { data };
  } catch (err: unknown) {
    console.error("Error fetching pipeline:", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to fetch pipeline";
    return { error: { message: errorMessage } };
  }
};
