"use client";

import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import { UserFormModal } from "@/components/users/user-form-modal";
import { UsersTable } from "@/components/users/users-table";

import { usersService } from "@/services/users.service";
import { User } from "@/types/user.types";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const loadUsers = async () => {
    try {
      const data = await usersService.getAll();
      setUsers(data);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenCreate = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData: any) => {
    try {
      if (selectedUser) {
        await usersService.update(selectedUser.id_usuario, formData);
        toast.success("Usuario actualizado correctamente");
      } else {
        await usersService.create(formData);
        toast.success("Usuario creado correctamente");
      }
      loadUsers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await usersService.delete(id);
      toast.success("Usuario dado de baja correctamente");
      loadUsers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <Toaster position="top-right" />
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">Gestión de Usuarios</h1>
        <UsersTable
          users={users}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          onOpenCreate={handleOpenCreate}
        />
        <UserFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          initialData={selectedUser}
        />
      </main>
    </div>
  );
}
