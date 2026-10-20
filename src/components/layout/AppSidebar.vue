<script setup>
import { RouterLink, useRoute } from 'vue-router';

const route = useRoute();

const itens = [
  { to: '/pets', texto: 'Pets', icone: 'bi-heart', secao: '/pets' },
  { to: '/pets/novo', texto: 'Novo pet', icone: 'bi-plus-circle' },
  { to: '/tutores', texto: 'Tutores', icone: 'bi-people', secao: '/tutores' },
  { to: '/tutores/novo', texto: 'Novo tutor', icone: 'bi-person-plus' },
];

// "Pets" e "Tutores" ficam ativos na listagem e nos detalhes,
// mas não na tela de cadastro (/novo), que tem o próprio item.
function estaAtivo(item) {
  if (item.secao) {
    return (
      route.path.startsWith(item.secao) && route.path !== `${item.secao}/novo`
    );
  }
  return route.path === item.to;
}
</script>

<template>
  <nav aria-label="Menu da PetSchool">
    <div class="nav flex-column nav-pills gap-1">
      <RouterLink
        v-for="item in itens"
        :key="item.to"
        class="nav-link"
        :class="{ active: estaAtivo(item) }"
        :to="item.to"
      >
        <i
          class="bi me-2"
          :class="item.icone"
        ></i>
        {{ item.texto }}
      </RouterLink>
    </div>
  </nav>
</template>
