export interface source_code_embedding {
    id: string;
    created_at: Date;
    updated_at: Date;
    source_code: string;
    embedding: number[];
    file_name: string;
    project_id: string;
}

export interface project {
    github_url: string;
    id: string;
    name: string;
    created_at: Date;
    updated_at: Date;
}