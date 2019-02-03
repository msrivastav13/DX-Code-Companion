export interface QueryResult {
    totalSize: number;
    done: boolean;
    records: Record[];
}

export interface Record {
    Name : string;
    NamespacePrefix : string;
}

export interface MetadataType {
    MetadataName : string;
    CommandName : string;
}

export interface ServerResult {
    Body : string;
}