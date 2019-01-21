export interface QueryResult {
    totalSize: number;
    done: boolean;
    records: Record[];
}

export interface Record {
    Name : string;
    NamespacePrefix : string;
}