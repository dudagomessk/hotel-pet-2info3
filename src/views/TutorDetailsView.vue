<script setup>
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import {
  buscarTutor,
  cadastrarPet,
  listarPetsDoTutor,
  removerTutor,
} from '@/services/api';
import {
  cpfCnpjOculto,
  formatarData,
  mascaraCep,
  mascaraTelefone,
} from '@/utils/masks';

const route = useRoute();
const router = useRouter();

// ID do tutor vindo da URL (/tutores/:id)
const tutorId = route.params.id;

const tutor = ref(null);
const pets = ref([]);
const carregando = ref(true);
const naoEncontrado = ref(false);
const erro = ref('');

const ESPECIES = ['Cachorro', 'Gato', 'Hamster', 'Coelho', 'Ave', 'Outro'];
const novoPet = ref({ nome: '', especie: '' });
const salvandoPet = ref(false);
const petValido = computed(
  () => novoPet.value.nome.trim() && novoPet.value.especie,
);

const temEndereco = computed(() =>
  ['rua', 'numero', 'bairro', 'cidade', 'estado', 'cep'].some(
    (c) => tutor.value?.[c],
  ),
);

// GET /pets?tutorId={id}
async function carregarPets() {
  pets.value = await listarPetsDoTutor(tutorId);
}

async function carregarTutor() {
  try {
    // GET /tutores/{id}
    tutor.value = await buscarTutor(tutorId);
    await carregarPets();
  } catch (e) {
    if (e.status === 404) naoEncontrado.value = true;
    else
      erro.value =
        'Não foi possível carregar os dados. Verifique se o JSON Server está rodando (npm run api).';
  } finally {
    carregando.value = false;
  }
}

async function salvarPet() {
  if (!petValido.value || salvandoPet.value) return;
  salvandoPet.value = true;
  try {
    // POST /pets: o tutorId já vem da rota, não precisa de select
    await cadastrarPet({
      nome: novoPet.value.nome.trim(),
      especie: novoPet.value.especie,
      tutorId: tutorId,
    });
    novoPet.value = { nome: '', especie: '' };
    await carregarPets(); // atualiza a lista de pets vinculados
  } catch {
    window.alert('Não foi possível cadastrar o pet.');
  } finally {
    salvandoPet.value = false;
  }
}

async function excluirTutor() {
  // não permite remover tutor que ainda tem pets vinculados
  if (pets.value.length > 0) {
    window.alert(
      'Este tutor possui pets vinculados. Remova ou transfira os pets antes de remover o tutor.',
    );
    return;
  }

  if (!window.confirm('Deseja realmente remover este tutor?')) return;

  try {
    await removerTutor(tutorId);
    router.push('/tutores');
  } catch {
    window.alert('Não foi possível remover o tutor.');
  }
}

onMounted(carregarTutor);
</script>

<template>
  <div>
    <header
      class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4"
    >
      <div>
        <h1 class="h2 fw-bold">Detalhes do Tutor</h1>
        <p class="text-body-secondary mb-0">
          Visualize os dados do tutor e seus pets vinculados.
        </p>
      </div>
      <RouterLink
        class="btn btn-outline-primary"
        to="/tutores"
      >
        <i class="bi bi-arrow-left me-1"></i>
        Voltar para Tutores
      </RouterLink>
    </header>

    <p
      v-if="carregando"
      class="text-body-secondary"
    >
      Carregando...
    </p>

    <div
      v-else-if="naoEncontrado"
      class="alert alert-warning"
      role="alert"
    >
      Tutor não encontrado.
    </div>

    <div
      v-else-if="erro"
      class="alert alert-danger"
      role="alert"
    >
      {{ erro }}
    </div>

    <template v-else-if="tutor">
      <!-- Dados do tutor -->
      <section class="card mb-3">
        <h2 class="card-header h5 mb-0">Dados do Tutor</h2>
        <div class="card-body">
          <dl class="row mb-0">
            <div class="col-md-4 mb-3">
              <dt>ID</dt>
              <dd class="mb-0">{{ tutor.id }}</dd>
            </div>
            <div class="col-md-4 mb-3">
              <dt>Nome Completo</dt>
              <dd class="mb-0">{{ tutor.nome }}</dd>
            </div>
            <div class="col-md-4 mb-3">
              <dt>CPF / CNPJ</dt>
              <dd class="mb-0">
                {{ tutor.cpfCnpj ? cpfCnpjOculto(tutor.cpfCnpj) : '—' }}
              </dd>
            </div>
            <div class="col-md-4">
              <dt>Telefone / Celular / WhatsApp</dt>
              <dd class="mb-0">{{ mascaraTelefone(tutor.telefone) }}</dd>
            </div>
            <div class="col-md-4">
              <dt>E-mail</dt>
              <dd class="mb-0">{{ tutor.email || '—' }}</dd>
            </div>
            <div class="col-md-4">
              <dt>Data de Nascimento</dt>
              <dd class="mb-0">
                {{
                  tutor.dataNascimento
                    ? formatarData(tutor.dataNascimento)
                    : '—'
                }}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <!-- Endereço (só aparece se tiver algum dado) -->
      <section
        v-if="temEndereco"
        class="card mb-3"
      >
        <h2 class="card-header h5 mb-0">Endereço</h2>
        <div class="card-body">
          <dl class="row mb-0">
            <div class="col-md-4 mb-3">
              <dt>Rua</dt>
              <dd class="mb-0">{{ tutor.rua || '—' }}</dd>
            </div>
            <div class="col-md-4 mb-3">
              <dt>Número</dt>
              <dd class="mb-0">{{ tutor.numero || '—' }}</dd>
            </div>
            <div class="col-md-4 mb-3">
              <dt>Bairro</dt>
              <dd class="mb-0">{{ tutor.bairro || '—' }}</dd>
            </div>
            <div class="col-md-4">
              <dt>Cidade</dt>
              <dd class="mb-0">{{ tutor.cidade || '—' }}</dd>
            </div>
            <div class="col-md-4">
              <dt>Estado</dt>
              <dd class="mb-0">{{ tutor.estado || '—' }}</dd>
            </div>
            <div class="col-md-4">
              <dt>CEP</dt>
              <dd class="mb-0">
                {{ tutor.cep ? mascaraCep(tutor.cep) : '—' }}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <!-- Pets vinculados -->
      <section class="card mb-3">
        <h2 class="card-header h5 mb-0">
          Pets vinculados
          <span class="badge text-bg-primary ms-2">
            {{ pets.length }} {{ pets.length === 1 ? 'pet' : 'pets' }}
          </span>
        </h2>

        <div class="table-responsive">
          <table class="table table-striped table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Espécie</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="pet in pets"
                :key="pet.id"
              >
                <td>{{ pet.id }}</td>
                <td>{{ pet.nome }}</td>
                <td>{{ pet.especie }}</td>
                <td>
                  <RouterLink
                    class="btn btn-sm btn-outline-primary"
                    :to="`/pets/${pet.id}`"
                  >
                    Visualizar Pet
                  </RouterLink>
                </td>
              </tr>
              <tr v-if="pets.length === 0">
                <td
                  colspan="4"
                  class="text-center text-body-secondary py-3"
                >
                  Nenhum pet vinculado a este tutor.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Cadastro de pet para este tutor -->
      <section class="card mb-3">
        <h2 class="card-header h5 mb-0">Cadastrar novo pet para este tutor</h2>
        <div class="card-body">
          <form
            class="row g-3 align-items-end"
            @submit.prevent="salvarPet"
          >
            <div class="col-md-5">
              <label
                for="petNome"
                class="form-label fw-semibold"
                >Nome do pet</label
              >
              <input
                id="petNome"
                v-model="novoPet.nome"
                type="text"
                class="form-control"
                placeholder="Digite o nome do pet"
                required
              />
            </div>
            <div class="col-md-4">
              <label
                for="petEspecie"
                class="form-label fw-semibold"
                >Espécie</label
              >
              <select
                id="petEspecie"
                v-model="novoPet.especie"
                class="form-select"
                required
              >
                <option
                  value=""
                  disabled
                >
                  Selecione a espécie
                </option>
                <option
                  v-for="especie in ESPECIES"
                  :key="especie"
                  :value="especie"
                >
                  {{ especie }}
                </option>
              </select>
            </div>
            <div class="col-md-3">
              <button
                type="submit"
                class="btn btn-success w-100"
                :disabled="!petValido || salvandoPet"
              >
                <i class="bi bi-plus-circle me-1"></i>
                Cadastrar Pet
              </button>
            </div>
          </form>
        </div>
      </section>

      <button
        type="button"
        class="btn btn-outline-danger"
        @click="excluirTutor"
      >
        Remover Tutor
      </button>
    </template>
  </div>
</template>
