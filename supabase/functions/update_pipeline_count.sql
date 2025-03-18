CREATE OR REPLACE FUNCTION public.update_pipeline_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER  -- Add this line
AS $function$
BEGIN
    -- Insert or update the pipeline_count for the user
    INSERT INTO public.user_pipeline_counts (user_id, pipeline_count)
    VALUES (
        COALESCE(NEW.user_id, OLD.user_id)::uuid,
        (
            SELECT COUNT(*)
            FROM public.pipeline_configs
            WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
        )
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET pipeline_count = (
        SELECT COUNT(*)
        FROM public.pipeline_configs
        WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$function$