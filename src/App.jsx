import './App.css';
import { useState } from 'react';
import FichaDoProcesso from './fichaDoProcesso';
import PropTypes from 'prop-types';

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
          clocks: []
        }));
        return [...processosAtualizados, ...novosProcessos];
      }

      // Se precisar remover processos
      return processosAtualizados.slice(0, quantidadeDeProcessos);
    });
  };

  const calcularFIFO = () => {
    // Cria uma cópia dos processos com os campos necessários
    const processosCalculados = processos.map(p => ({
      ...p,
      clocks: [],
      tempoRestante: p.tempoDeExecucao,
      deadlineEstourado: false
    }));

    // Ordena os processos por tempo de chegada
    processosCalculados.sort((a, b) => a.tempoDeChegada - b.tempoDeChegada);

    let tempoAtual = 0;
    let processosFinalizados = 0;

    // Continua até que todos os processos sejam finalizados
    while (processosFinalizados < processosCalculados.length) {
      // Encontra o próximo processo que já chegou e ainda não terminou
      const processoAtual = processosCalculados.find(p =>
        p.tempoDeChegada <= tempoAtual &&
        p.tempoRestante > 0
      );

      // Para cada processo, atualiza seu estado no clock atual
      processosCalculados.forEach(processo => {
        // Verifica se o deadline foi estourado
        if (tempoAtual >= processo.tempoDeChegada + processo.deadLine) {
          processo.deadlineEstourado = true;
        }

        // Define o estado do processo no clock atual
        if (processo.tempoDeChegada > tempoAtual) {
          // Processo ainda não chegou
          processo.clocks[tempoAtual] = '';
        } else if (processo === processoAtual) {
          // Processo está executando
          processo.clocks[tempoAtual] = processo.deadlineEstourado
            ? 'executando - dead'
            : 'executando';
          processo.tempoRestante--;

          // Verifica se o processo terminou
          if (processo.tempoRestante === 0) {
            processosFinalizados++;
          }
        } else if (processo.tempoRestante > 0) {
          // Processo está esperando
          processo.clocks[tempoAtual] = processo.deadlineEstourado
            ? 'espera - dead'
            : 'espera';
        } else {
          // Processo já terminou
          processo.clocks[tempoAtual] = '';
        }
      });

      tempoAtual++;
    }

    // Atualiza o estado com os processos calculados
    setProcessos(processosCalculados.map(p => ({
      ...p,
      clocks: p.clocks
    })));
  };

  const calcularSJF = () => {
    // Cria uma cópia dos processos com os campos necessários
    const processosCalculados = processos.map(p => ({
      ...p,
      clocks: [],
      tempoRestante: p.tempoDeExecucao,
      deadlineEstourado: false
    }));

    let tempoAtual = 0;
    let processosFinalizados = 0;
    let processoAtualEmExecucao = null;

    while (processosFinalizados < processosCalculados.length) {
      // Se não há processo em execução, procura o próximo
      if (!processoAtualEmExecucao) {
        // Encontra todos os processos que já chegaram e ainda não terminaram
        const processosDisponiveis = processosCalculados.filter(p =>
          p.tempoDeChegada <= tempoAtual &&
          p.tempoRestante > 0
        );

        if (processosDisponiveis.length > 0) {
          // Seleciona o processo com menor tempo restante
          processoAtualEmExecucao = processosDisponiveis.reduce((menor, atual) =>
            atual.tempoRestante < menor.tempoRestante ? atual : menor
          );
        }
      }

      // Atualiza o estado de cada processo
      processosCalculados.forEach(processo => {
        // Verifica se o deadline foi estourado
        if (tempoAtual >= processo.tempoDeChegada + processo.deadLine) {
          processo.deadlineEstourado = true;
        }

        // Define o estado do processo no clock atual
        if (processo.tempoDeChegada > tempoAtual) {
          // Processo ainda não chegou
          processo.clocks[tempoAtual] = '';
        } else if (processo === processoAtualEmExecucao) {
          // Processo está executando
          processo.clocks[tempoAtual] = processo.deadlineEstourado
            ? 'executando - dead'
            : 'executando';
          processo.tempoRestante--;

          // Verifica se o processo terminou
          if (processo.tempoRestante === 0) {
            processosFinalizados++;
            processoAtualEmExecucao = null; // Libera para escolher próximo processo
          }
        } else if (processo.tempoRestante > 0) {
          // Processo está esperando
          processo.clocks[tempoAtual] = processo.deadlineEstourado
            ? 'espera - dead'
            : 'espera';
        } else {
          // Processo já terminou
          processo.clocks[tempoAtual] = '';
        }
      });

      tempoAtual++;
    }

    // Atualiza o estado com os processos calculados
    setProcessos(processosCalculados.map(p => ({
      ...p,
      clocks: p.clocks
    })));
  };

  const calcularRoundRobin = () => {
    const processosCalculados = processos.map(p => ({
      ...p,
      clocks: [],
      tempoRestante: p.tempoDeExecucao,
      deadlineEstourado: false,
      quantumRestante: quantum // adiciona controle do quantum
    }));

    let tempoAtual = 0;
    let processosFinalizados = 0;
    let emSobrecarga = false;
    let tempoDeSobrecargaRestante = 0;
    let ultimoProcessoExecutado = null;

    while (processosFinalizados < processosCalculados.length) {
      // Verifica se está em período de sobrecarga
      if (emSobrecarga) {
        // Marca todos os processos como em sobrecarga
        processosCalculados.forEach(processo => {
          // Verifica deadline
          if (tempoAtual >= processo.tempoDeChegada + processo.deadLine) {
            processo.deadlineEstourado = true;
          }

          if (processo.tempoDeChegada <= tempoAtual) {
            processo.clocks[tempoAtual] = 'sobrecarga';
          } else {
            processo.clocks[tempoAtual] = '';
          }
        });

        tempoDeSobrecargaRestante--;
        if (tempoDeSobrecargaRestante === 0) {
          emSobrecarga = false;
        }
        tempoAtual++;
        continue;
      }

      // Encontra próximo processo a ser executado
      const processosDisponiveis = processosCalculados.filter(p =>
        p.tempoDeChegada <= tempoAtual &&
        p.tempoRestante > 0
      );

      let processoAtual = null;
      if (processosDisponiveis.length > 0) {
        if (ultimoProcessoExecutado) {
          // Procura o próximo processo após o último executado
          const indexUltimo = processosDisponiveis.indexOf(ultimoProcessoExecutado);
          if (indexUltimo !== -1 && indexUltimo < processosDisponiveis.length - 1) {
            processoAtual = processosDisponiveis[indexUltimo + 1];
          } else {
            processoAtual = processosDisponiveis[0];
          }
        } else {
          processoAtual = processosDisponiveis[0];
        }
      }

      processosCalculados.forEach(processo => {
        // Verifica deadline
        if (tempoAtual >= processo.tempoDeChegada + processo.deadLine) {
          processo.deadlineEstourado = true;
        }

        if (processo.tempoDeChegada > tempoAtual) {
          processo.clocks[tempoAtual] = '';
        } else if (processo === processoAtual) {
          processo.clocks[tempoAtual] = processo.deadlineEstourado
            ? 'executando - dead'
            : 'executando';
          processo.tempoRestante--;
          processo.quantumRestante--;

          // Verifica se terminou execução ou quantum
          if (processo.tempoRestante === 0) {
            processosFinalizados++;
            ultimoProcessoExecutado = null;
          } else if (processo.quantumRestante === 0) {
            // Prepara sobrecarga se houver mais processos esperando
            if (processosDisponiveis.length > 1 && sobrecarga > 0) {
              emSobrecarga = true;
              tempoDeSobrecargaRestante = sobrecarga;
            }
            processo.quantumRestante = quantum;
            ultimoProcessoExecutado = processo;
          } else {
            ultimoProcessoExecutado = processo;
          }
        } else if (processo.tempoRestante > 0) {
          processo.clocks[tempoAtual] = processo.deadlineEstourado
            ? 'espera - dead'
            : 'espera';
        } else {
          processo.clocks[tempoAtual] = '';
        }
      });

      tempoAtual++;
    }

    setProcessos(processosCalculados.map(p => ({
      ...p,
      clocks: p.clocks
    })));
  };

  const calcularEDF = () => {
    const processosCalculados = processos.map(p => ({
      ...p,
      clocks: [],
      tempoRestante: p.tempoDeExecucao,
      deadlineEstourado: false,
      deadlineAbsoluto: p.tempoDeChegada + p.deadLine // deadline absoluto para comparação
    }));

    let tempoAtual = 0;
    let processosFinalizados = 0;
    let emSobrecarga = false;
    let tempoDeSobrecargaRestante = 0;
    let ultimoProcessoExecutado = null;

    while (processosFinalizados < processosCalculados.length) {
      // Verifica se está em período de sobrecarga
      if (emSobrecarga) {
        processosCalculados.forEach(processo => {
          // Verifica deadline
          if (tempoAtual >= processo.deadlineAbsoluto) {
            processo.deadlineEstourado = true;
          }

          if (processo.tempoDeChegada <= tempoAtual) {
            processo.clocks[tempoAtual] = 'sobrecarga';
          } else {
            processo.clocks[tempoAtual] = '';
          }
        });

        tempoDeSobrecargaRestante--;
        if (tempoDeSobrecargaRestante === 0) {
          emSobrecarga = false;
        }
        tempoAtual++;
        continue;
      }

      // Encontra processos disponíveis (que já chegaram e não terminaram)
      const processosDisponiveis = processosCalculados.filter(p =>
        p.tempoDeChegada <= tempoAtual &&
        p.tempoRestante > 0
      );

      // Seleciona o processo com menor deadline absoluto
      const processoAtual = processosDisponiveis.length > 0
        ? processosDisponiveis.reduce((menor, atual) =>
          atual.deadlineAbsoluto < menor.deadlineAbsoluto ? atual : menor
        )
        : null;

      // Se houve troca de processo e tem sobrecarga
      if (processoAtual && ultimoProcessoExecutado &&
        processoAtual !== ultimoProcessoExecutado &&
        sobrecarga > 0) {
        emSobrecarga = true;
        tempoDeSobrecargaRestante = sobrecarga;
        ultimoProcessoExecutado = processoAtual;
        continue;
      }

      processosCalculados.forEach(processo => {
        // Verifica deadline
        if (tempoAtual >= processo.deadlineAbsoluto) {
          processo.deadlineEstourado = true;
        }

        if (processo.tempoDeChegada > tempoAtual) {
          processo.clocks[tempoAtual] = '';
        } else if (processo === processoAtual) {
          processo.clocks[tempoAtual] = processo.deadlineEstourado
            ? 'executando - dead'
            : 'executando';
          processo.tempoRestante--;

          if (processo.tempoRestante === 0) {
            processosFinalizados++;
          }
          ultimoProcessoExecutado = processo;
        } else if (processo.tempoRestante > 0) {
          processo.clocks[tempoAtual] = processo.deadlineEstourado
            ? 'espera - dead'
            : 'espera';
        } else {
          processo.clocks[tempoAtual] = '';
        }
      });

      tempoAtual++;
    }

    setProcessos(processosCalculados.map(p => ({
      ...p,
      clocks: p.clocks
    })));
  };

  const GraficoGantt = ({ processos }) => {
    // ... código existente ...
    return (
      <div className="grafico-gantt">
        <h2 className='ganttTittle'>Gráfico de Execução</h2>
        <div className="linha-processo">
          <div className="clocks-container">
            {processos[0]?.clocks.concat(['']).map((_, index) => (
              <div key={index} className="index-position">
                {index}
              </div>
            ))}
          </div>
        </div>
        {/* Processos existentes */}
        {processos.map((processo, index) => (
          <div key={index} className="linha-processo">
            <div className="nome-processo">{processo.nomeDoProcesso}</div>
            <div className="clocks-container">
              {processo.clocks.map((estado, clockIndex) => (
                <div
                  key={clockIndex}
                  className={`clock-box ${estado}`}
                  title={`P${index + 1} - Clock ${clockIndex}: ${estado}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  GraficoGantt.propTypes = {
    processos: PropTypes.arrayOf(PropTypes.shape({
      clocks: PropTypes.array.isRequired
    })).isRequired
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
            min={2}
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

      {/* Seleciona tipo de algoritmo */}
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
      
      {/* Botão ativar cálculo */}
      <button
        className='basicButton'
        onClick={() => {
          switch (tipoDeAlgoritmo) {
            case 'fifo':
              calcularFIFO();
              break;
            case 'sjf':
              calcularSJF();
              break;
            case 'rr':
              calcularRoundRobin();
              break;
            case 'edf':
              calcularEDF();
              break;
            default:
              break;
          }
        }}
      >
        Calcular Escalonamento
      </button>

      {/* REMOVER - Div temporária com os valores dos inputs dos processos */}
      {/* {processos.length > 0 && (
        <div className='proccessList'>
          {processos.map((processo, index) => (
            <p key={index}>
              Processo {index + 1}: {JSON.stringify(processo)}
            </p>
          ))}
          <p>{tipoDeAlgoritmo}</p>
          <p>{sobrecarga}</p>
        </div>
      )} */}


      {(processos.length > 0 && processos[0].clocks) && (
        <div className="gantt-container">
          <GraficoGantt processos={processos} />
        </div>
      )}

    </main>
  );
}

export default App;