<script setup>
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import {
  listarPets,
  listarTutores,
  removerTutor as apiRemoverTutor,
} from '@/services/api';
import { cpfCnpjOculto, mascaraTelefone, somenteDigitos } from '@/utils/masks';

const tutores = ref([]);
const pets = ref([]);
const busca = ref('');
const erro = ref('');

async function carregarDados() {
  try {
    erro.value = '';
    // GET /tutores e GET /pets (para contar e listar os pets de cada tutor)
    const [listaTutores, listaPets] = await Promise.all([
      listarTutores(),
      listarPets(),
    ]);
    tutores.value = listaTutores;
    pets.value = listaPets;
  } catch {
    erro.value =
      'Não foi possível carregar os tutores. Verifique se o JSON Server está rodando (npm run api).';
  }
}

// pets cujo tutorId é igual ao id do tutor
function petsDoTutor(tutor) {
  return pets.value.filter((pet) => String(pet.tutorId) === String(tutor.id));
}

const tutoresFiltrados = computed(() => {
  const termo = busca.value.trim().toLowerCase();
  const termoDigitos = somenteDigitos(termo);
  if (!termo) return tutores.value;

  return tutores.value.filter(
    (t) =>
      t.nome?.toLowerCase().includes(termo) ||
      t.email?.toLowerCase().includes(termo) ||
      (termoDigitos && somenteDigitos(t.cpfCnpj).includes(termoDigitos)),
  );
});

async function excluirTutor(tutor) {
  // Antes de excluir, verifica se o tutor possui pets vinculados.
  if (petsDoTutor(tutor).length > 0) {
    window.alert(
      'Este tutor possui pets vinculados. Remova ou transfira os pets antes de remover o tutor.',
    );
    return;
  }

  if (!window.confirm('Deseja realmente remover este tutor?')) return;

  try {
    await apiRemoverTutor(tutor.id);
    await carregarDados(); // atualiza a listagem
  } catch {
    window.alert('Não foi possível remover o tutor.');
  }
}

onMounted(carregarDados);
</script>

<template>
  <div>
    <header
      class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4"
    >
      <div>
        <h1 class="h2 fw-bold">Listagem de Tutores</h1>
        <p class="text-body-secondary mb-0">
          Consulte os tutores cadastrados e seus pets.
        </p>
      </div>
      <RouterLink
        class="btn btn-primary"
        to="/tutores/novo"
      >
        <i class="bi bi-plus-lg me-1"></i>
        Cadastrar Tutor
      </RouterLink>
    </header>

    <div
      v-if="erro"
      class="alert alert-danger"
      role="alert"
    >
      {{ erro }}
    </div>

    <div class="input-group mb-4">
      <span class="input-group-text bg-white">
        <i class="bi bi-search"></i>
      </span>
      <input
        v-model="busca"
        type="search"
        class="form-control"
        placeholder="Pesquisar tutor por nome, CPF/CNPJ ou e-mail"
      />
    </div>

    <div class="table-responsive">
      <table class="table table-striped table-hover align-middle border">
        <thead class="table-light">
          <tr>
            <th>ID</th>
            <th>Nome Completo</th>
            <th>CPF / CNPJ</th>
            <th>Telefone / Celular / WhatsApp</th>
            <th>E-mail</th>
            <th class="text-center">Pets (Quantidade)</th>
            <th>Nomes dos Pets</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="tutor in tutoresFiltrados"
            :key="tutor.id"
          >
            <td>{{ tutor.id }}</td>
            <td>{{ tutor.nome }}</td>
            <td>{{ tutor.cpfCnpj ? cpfCnpjOculto(tutor.cpfCnpj) : '—' }}</td>
            <td>{{ mascaraTelefone(tutor.telefone) }}</td>
            <td>{{ tutor.email || '—' }}</td>
            <td class="text-center">{{ petsDoTutor(tutor).length }}</td>
            <td>
              <template v-if="petsDoTutor(tutor).length">
                {{
                  petsDoTutor(tutor)
                    .map((p) => p.nome)
                    .join(' / ')
                }}
              </template>
              <span
                v-else
                class="text-body-secondary"
                >Nenhum pet vinculado</span
              >
            </td>
            <td class="text-nowrap">
              <RouterLink
                class="btn btn-sm btn-outline-primary me-2"
                :to="`/tutores/${tutor.id}`"
              >
                <i class="bi bi-eye-fill me-1"></i>
                Visualizar
              </RouterLink>
              <button
                type="button"
                class="btn btn-sm btn-outline-danger"
                @click="excluirTutor(tutor)"
              >
                <i class="bi bi-trash me-1"></i>
                Remover
              </button>
            </td>
          </tr>
          <tr v-if="!tutoresFiltrados.length">
            <td
              colspan="8"
              class="text-center text-body-secondary py-4"
            >
              Nenhum tutor encontrado.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="text-body-secondary small">
      Exibindo {{ tutoresFiltrados.length }}
      {{ tutoresFiltrados.length === 1 ? 'tutor' : 'tutores' }}
    </p>
  </div>
</template>
