<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const API_URL = 'http://localhost:3000';
const tutor = ref({});

async function carregarTutor() {
  try {
    const resposta = await fetch(`${API_URL}/tutores/${route.params.id}`);
    if (!resposta.ok) {
      console.log('Opees, Tutor Não encontrado!');
    }

    tutor.value = await resposta.json();
  } catch (erro) {
    console.error('Erro ao carregar os dados do tutor:', erro);
  }
}

onMounted(carregarTutor);
</script>

<template>
  <h1>Nome: {{ tutor.nome }}</h1>
  <p>ID: {{ tutor.id }}</p>
  <p>Telefone: {{ tutor.telefone }}</p>
</template>
