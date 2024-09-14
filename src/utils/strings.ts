export const CreatePartitionSQL = (partitionName: string, eventId: number) => `
       DO $$
BEGIN
    -- Define the partition name
    DECLARE
        partition_name TEXT := '${partitionName}';
    BEGIN
        -- Check if the partition table already exists
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = partition_name
        ) THEN
            -- Create the partition table
            EXECUTE '
                CREATE TABLE public."${partitionName}" PARTITION OF public.tickets
                FOR VALUES IN (${eventId})
            ';
        END IF;
    END;
END
$$;


    `