export interface Todo {
  id: number;
  content: string;
}

export interface Meta {
  totalCount: number;
}

export interface TableColumn{
  name:     string;
  label:    string;
  align?:   string;
  field?:    string;
}


