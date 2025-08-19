export type User = {
  user_id: number;
  employee_code?: string | null;
  username: string;
  password_hash?: string | null;
  email?: string | null;
  full_name?: string | null;
  user_group_id: number | null;
  image_url?: string | null;
  department?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Group = {
  group_id: number;
  group_name: string;
  description?: string | null;
  is_active: boolean;
};

export type Screen = {
  code: string;
  name: string;
};

export type Permission = {
  permission_id: number;
  group_id: number;
  screen_code: string;
  can_view: boolean;
  can_add: boolean;
  can_edit: boolean;
  can_delete: boolean;
};

export type Payload = {
  users: User[];
  groups: Group[];
  screens: Screen[];
  permissions: Permission[];
};
