import './App.css';
import { useState } from 'react';
import FichaDoProcesso from './fichaDoProcesso';

function App() {
  const [processos, setProcessos] = useState([]);
  const [quantum, setQuantum] = useState(1);
  const [quantidadeDeProcessos, setQuantidadeDeProcessos] = useState();
  const [tipoDeAlgoritmo, setTipoDeAlgoritmo] = useState('fifo')
  const [sobrecarga, setSobrecarga] = useState()

  const handleGenerateProcessos = () => {
    setProcessos(processosAnteriores => {
      // Mantém os processos existentes
      const processosAtualizados = [...processosAnteriores];

      // Calcula quantos novos processos precisam ser adicionados
      const processosParaAdicionar = quantidadeDeProcessos - processosAtualizados.length;

      // Se precisar adicionar mais processos
      if (processosParaAdicionar > 0) {
        const novosProcessos = Array.from({ length: processosParaAdicionar }, () => ({
          nomeDoProcesso: '',
          tempoDeChegada: 0,
          tempoDeExecucao: 0,
          deadLine: 0,
          clocs: []
        }));
        return [...processosAtualizados, ...novosProcessos];
      }

      // Se precisar remover processos
      return processosAtualizados.slice(0, quantidadeDeProcessos);
    });
  };

  return (
    <main>
      <h1>Escalonador de Processos</h1>

      {/* Formulário de input de quantum e quantidade de processos e sobrecarga*/}
      <div className="basicForm">
        {/* quantum */}
        <div>
          <label htmlFor="quantum">
            Quantum:
          </label>
          <input
            type="number"
            id="quantum"
            value={quantum}
            onChange={(e) => setQuantum(Number(e.target.value))}
            min={1}
            required
          />
        </div>

        {/* sobrecarga */}
        <div>
          <label htmlFor="sobrecarga">
            Sobrecarga:
          </label>
          <input
            type="number"
            id="sobrecarga"
            value={sobrecarga}
            onChange={(e) => setSobrecarga(Number(e.target.value))}
            min={0}
            required
          />
        </div>

        {/* quantidade de processos */}
        <div>
          <label htmlFor="quantidadeDeProcessos">
            Quantidade de Processos:
          </label>
          <input
            type="number"
            id="quantidadeDeProcessos"
            value={quantidadeDeProcessos}
            onChange={(e) => setQuantidadeDeProcessos(Number(e.target.value))}
            min={0}
            required
          />
        </div>
      </div>

      {/* Botão gerador das fichas de processo */}
      <button className='basicButton'
        onClick={handleGenerateProcessos}
      >
        Gerar Processos
      </button>

      {/* Inputs dos processos */}
      {processos.length > 0 && (
        <div className='proccessList'>
          {processos.map((_, index) => (
            <FichaDoProcesso
              key={index}
              setProcessos={setProcessos}
              processos={processos}
              index={index}
            />
          ))}
        </div>
      )}

      {/* REMOVER - Div temporária com os valores dos inputs dos processos */}
      {processos.length > 0 && (
        <div className='proccessList'>
          {processos.map((processo, index) => (
            <p key={index}>
              Processo {index + 1}: {JSON.stringify(processo)}
            </p>
          ))}
          <p>{tipoDeAlgoritmo}</p>
          <p>{sobrecarga}</p>
        </div>
      )}

      <div className='typeSelector'>
        <button
          onClick={() => setTipoDeAlgoritmo('fifo')}
          className={tipoDeAlgoritmo === 'fifo' ? 'active' : ''}
        >
          FIFO
        </button>
        <button
          onClick={() => setTipoDeAlgoritmo('sjf')}
          className={tipoDeAlgoritmo === 'sjf' ? 'active' : ''}
        >
          SJF
        </button>
        <button
          onClick={() => setTipoDeAlgoritmo('rr')}
          className={tipoDeAlgoritmo === 'rr' ? 'active' : ''}
        >
          Round Robin
        </button>
        <button
          onClick={() => setTipoDeAlgoritmo('edf')}
          className={tipoDeAlgoritmo === 'edf' ? 'active' : ''}
        >
          EDF
        </button>
      </div>

    </main>
  );
}

export default App;