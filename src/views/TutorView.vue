<script setup>
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';

const API_URL = 'http://localhost:3000';

const tutores = ref([]);

async function carregarTutores() {
  const resposta = await fetch(`${API_URL}/tutores`);
  tutores.value = await resposta.json();
}

async function excluirTutor(id) {
  const confirmarExclusao = window.confirm(
    'Deseja realmente excluir esse tutor?',
  );

  if (confirmarExclusao) {
    await fetch(`${API_URL}/tutores/${id}`, {
      method: 'DELETE',
    });

    await carregarTutores();
  }
}

onMounted(carregarTutores);
</script>

<template>
  <div>
    <header class="mb-4">
      <h1 class="text-2xl font-bold">Listagem de Tutores</h1>
      <p class="text-body-secondary mb-0">
        Listagem dos Tutores cadastrados no sistema.
      </p>
    </header>

    <RouterLink
      class="btn btn-primary"
      to="/tutores/novo"
    >
      Novo Tutor
    </RouterLink>
  </div>

  <table class="table table-striped table-hover">
    <thead>
      <tr>
        <th>ID</th>
        <th>Nome</th>
        <th>Telefone</th>
        <th>Ações</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="tutor in tutores"
        :key="tutor.id"
      >
        <td>{{ tutor.id }}</td>
        <td>{{ tutor.nome }}</td>
        <td>{{ tutor.telefone }}</td>
        <td>
          <RouterLink :to="`/tutores/${tutor.id}`"> Visualizar </RouterLink>
          <button
            class="btn btn-danger"
            @click="excluirTutor(tutor.id)"
          >
            Excluir
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>
