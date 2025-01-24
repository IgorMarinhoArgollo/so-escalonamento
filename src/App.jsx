import './App.css';
import { useState, useEffect } from 'react';
import FichaDoProcesso from './fichaDoProcesso';
import GraficoGantt from './graficoGantt';
import { useRef } from 'react';


function App() {
  const graficoRef = useRef();

  const [processos, setProcessos] = useState([]);
  const [quantum, setQuantum] = useState(1);
  const [quantidadeDeProcessos, setQuantidadeDeProcessos] = useState();
  const [tipoDeAlgoritmo, setTipoDeAlgoritmo] = useState('fifo')
  const [sobrecarga, setSobrecarga] = useState()
  const [mostrarGrafico, setMostrarGrafico] = useState(false);
  const [animationTime, setAnimationTime] = useState(1);
  const [algoritmoPaginacao, setAlgoritmoPaginacao] = useState('fifo');
  const [disco, setDisco] = useState(Array(100).fill(null));
  const [ram, setRam] = useState(Array(50).fill(null));
  

  useEffect(() => { }, [ram]);

  const handleInputChange = (e) => {
    setMostrarGrafico(false);
    setDisco(Array(100).fill(null));
    setRam(Array(50).fill(null))
    const { id, value } = e.target;
    if (id === "quantum") setQuantum(Number(value));
    if (id === "sobrecarga") setSobrecarga(Number(value));
    if (id === "quantidadeDeProcessos") setQuantidadeDeProcessos(Number(value));
    if (id === "animationTime") setAnimationTime(Number(value));
  };

  useEffect(() => {}, [ram]);

  const handleGenerateProcessos = () => {
    setMostrarGrafico(false);
    setDisco(Array(100).fill(null)); // resetar o array disco no estado (não testado ainda)
    setRam(Array(50).fill(null)) // resetar o array ram no estado (não testado ainda)
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
          paginas: Math.floor(Math.random() * 10) + 1,
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
      // Atualiza o status de deadline para todos os processos primeiro
      processosCalculados.forEach(processo => {
        if (processo.deadLine > 0 && tempoAtual >= processo.tempoDeChegada + processo.deadLine) {
          processo.deadlineEstourado = true;
        }
      });

      // Encontra o próximo processo que já chegou e ainda não terminou
      const processoAtual = processosCalculados.find(p =>
        p.tempoDeChegada <= tempoAtual &&
        p.tempoRestante > 0
      );

      // Para cada processo, atualiza seu estado no clock atual
      processosCalculados.forEach(processo => {
        if (processo.tempoDeChegada > tempoAtual) {
          processo.clocks[tempoAtual] = '';
        } else if (processo === processoAtual) {
          processo.clocks[tempoAtual] = processo.deadlineEstourado
            ? 'executando-dead'
            : 'executando';
          processo.tempoRestante--;

          if (processo.tempoRestante === 0) {
            processosFinalizados++;
          }
        } else if (processo.tempoRestante > 0) {
          processo.clocks[tempoAtual] = (processo.deadLine > 0 && processo.deadlineEstourado)
            ? 'espera-dead'
            : 'espera';
        } else {
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
        if (processo.deadLine > 0 && tempoAtual >= processo.tempoDeChegada + processo.deadLine) {
          processo.deadlineEstourado = true;
        }

        // Define o estado do processo no clock atual
        if (processo.tempoDeChegada > tempoAtual) {
          // Processo ainda não chegou
          processo.clocks[tempoAtual] = '';
        } else if (processo === processoAtualEmExecucao) {
          processo.clocks[tempoAtual] = (processo.deadLine > 0 && processo.deadlineEstourado)
            ? 'executando-dead'
            : 'executando';
          processo.tempoRestante--;

          // Verifica se o processo terminou
          if (processo.tempoRestante === 0) {
            processosFinalizados++;
            processoAtualEmExecucao = null;
          }
        } else if (processo.tempoRestante > 0) {
          processo.clocks[tempoAtual] = (processo.deadLine > 0 && processo.deadlineEstourado)
            ? 'espera-dead'
            : 'espera';
        } else {
          // Processo já terminou
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

  const calcularRoundRobin = () => {
    const processosCalculados = processos.map(p => ({
      ...p,
      clocks: [],
      tempoRestante: p.tempoDeExecucao,
      deadlineEstourado: false,
      quantumRestante: quantum
    }));

    let tempoAtual = 0;
    let processosFinalizados = 0;
    let emSobrecarga = false;
    let tempoDeSobrecargaRestante = 0;
    let filaDeExecucao = [];
    let indexAtual = 0;
    let processoEmSobrecarga = null;

    while (processosFinalizados < processosCalculados.length) {
      // Verifica se está em período de sobrecarga
      if (emSobrecarga) {
        processosCalculados.forEach(processo => {
          if (tempoAtual >= processo.tempoDeChegada + processo.deadLine) {
            processo.deadlineEstourado = true;
          }

          // Apenas o processo em sobrecarga recebe o estado 'sobrecarga'
          if (processo === processoEmSobrecarga) {
            processo.clocks[tempoAtual] = 'sobrecarga';
          } else if (processo.tempoRestante > 0 && processo.tempoDeChegada <= tempoAtual) {
            processo.clocks[tempoAtual] = processo.deadlineEstourado && processo.deadLine > 0
              ? 'espera-dead'
              : 'espera';
          } else {
            processo.clocks[tempoAtual] = '';
          }
        });

        tempoDeSobrecargaRestante--;
        if (tempoDeSobrecargaRestante === 0) {
          emSobrecarga = false;
          processoEmSobrecarga = null; // Limpa o processo em sobrecarga
        }
        tempoAtual++;
        continue;
      }

      // Atualiza a fila de execução
      filaDeExecucao = processosCalculados.filter(
        p => p.tempoDeChegada <= tempoAtual && p.tempoRestante > 0
      );

      if (filaDeExecucao.length === 0) {
        // Avança o tempo se nenhum processo está disponível
        tempoAtual++;
        continue;
      }

      // Seleciona o processo atual da fila
      const processoAtual = filaDeExecucao[indexAtual % filaDeExecucao.length];

      processosCalculados.forEach(processo => {
        if (tempoAtual >= processo.tempoDeChegada + processo.deadLine) {
          processo.deadlineEstourado = true;
        }

        if (processo === processoAtual) {
          processo.clocks[tempoAtual] = processo.deadlineEstourado && processo.deadLine > 0
            ? 'executando-dead'
            : 'executando';
          processo.tempoRestante--;
          processo.quantumRestante--;

          // Verifica se terminou execução ou quantum
          if (processo.tempoRestante === 0) {
            processosFinalizados++;
            filaDeExecucao = filaDeExecucao.filter(p => p !== processo);
            indexAtual = 0; // Reinicia o índice para garantir a ordem correta
          } else if (processo.quantumRestante === 0) {
            // Reinicia o quantum e aplica sobrecarga para o processo atual
            processo.quantumRestante = quantum;

            if (sobrecarga > 0) {
              emSobrecarga = true;
              tempoDeSobrecargaRestante = sobrecarga;
              processoEmSobrecarga = processo; // Define o processo em sobrecarga
            }
            indexAtual++;
          }
        } else if (processo.tempoRestante > 0) {
          processo.clocks[tempoAtual] = processo.deadlineEstourado && processo.deadLine > 0
            ? 'espera-dead'
            : 'espera';
        } else {
          processo.clocks[tempoAtual] = '';
        }
      });

      tempoAtual++;
    }

    setProcessos(
      processosCalculados.map(p => ({
        ...p,
        clocks: p.clocks
      }))
    );
  };

  const calcularEDF = () => {
    const processosCalculados = processos.map(p => ({
      ...p,
      clocks: [],
      tempoRestante: p.tempoDeExecucao,
      deadlineEstourado: false,
      deadlineAbsoluto: p.tempoDeChegada + p.deadLine,
      quantumRestante: quantum
    }));

    let tempoAtual = 0;
    let processosFinalizados = 0;
    let emSobrecarga = false;
    let tempoDeSobrecargaRestante = 0;
    let ultimoProcessoExecutado = null;

    while (processosFinalizados < processosCalculados.length) {
      if (emSobrecarga) {
        processosCalculados.forEach(processo => {
          if (tempoAtual > processo.deadlineAbsoluto) {
            processo.deadlineEstourado = true;
          }

          if (processo === ultimoProcessoExecutado) {
            processo.clocks[tempoAtual] = 'sobrecarga';
          } else if (processo.tempoRestante > 0 && processo.tempoDeChegada <= tempoAtual) {
            processo.clocks[tempoAtual] = processo.deadlineEstourado
              ? 'espera-dead'
              : 'espera';
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

      const processosDisponiveis = processosCalculados.filter(p =>
        p.tempoDeChegada <= tempoAtual &&
        p.tempoRestante > 0
      );

      const processoAtual = processosDisponiveis.length > 0
        ? processosDisponiveis.reduce((menor, atual) =>
          atual.deadlineAbsoluto < menor.deadlineAbsoluto ? atual : menor
        )
        : null;

      processosCalculados.forEach(processo => {
        if (tempoAtual > processo.deadlineAbsoluto) {
          processo.deadlineEstourado = true;
        }

        if (processo === processoAtual) {
          processo.clocks[tempoAtual] = processo.deadlineEstourado
            ? 'executando-dead'
            : 'executando';
          processo.tempoRestante--;
          processo.quantumRestante--;

          if (processo.tempoRestante === 0) {
            processosFinalizados++;
          } else if (processo.quantumRestante === 0) {
            processo.quantumRestante = quantum;
            if (sobrecarga > 0) {
              emSobrecarga = true;
              tempoDeSobrecargaRestante = sobrecarga;
            }
          }
          ultimoProcessoExecutado = processo;
        } else if (processo.tempoRestante > 0 && processo.tempoDeChegada <= tempoAtual) {
          processo.clocks[tempoAtual] = processo.deadlineEstourado
            ? 'espera-dead'
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

  const calcularPaginacaoFIFO = () => {
    const maxClockLength = Math.max(...processos.map((p) => p.clocks.length));
    const interval = (animationTime * 1000) / maxClockLength;

    const ramSize = 50; // Tamanho da RAM
    const filaDePaginas = []; // Fila para gerenciar as páginas na RAM

    // Inicializa a RAM com null
    let novaRam = Array(ramSize).fill(null);

    const atualizarRam = (clock) => {
      if (clock >= maxClockLength) return;

      processos.forEach((processo) => {
        const estado = processo.clocks[clock];

        if (estado && estado.startsWith('executando')) {
          // Simula a execução do processo e a troca de páginas
          for (let pagina = 0; pagina < processo.paginas; pagina++) {
            const paginaAtual = {
              nomeDoProcesso: processo.nomeDoProcesso,
              indexNoProcesso: pagina + 1,
            };

            // Verifica se a página já está na RAM
            const paginaNaRam = novaRam.find(
              (p) =>
                p &&
                p.nomeDoProcesso === paginaAtual.nomeDoProcesso &&
                p.indexNoProcesso === paginaAtual.indexNoProcesso
            );

            if (!paginaNaRam) {
              // Se a RAM estiver cheia, remove a página mais antiga (FIFO)
              if (filaDePaginas.length >= ramSize) {
                const paginaRemovida = filaDePaginas.shift();
                novaRam = novaRam.map((p) =>
                  p === paginaRemovida ? null : p
                );
              }

              // Adiciona a nova página na RAM e na fila
              filaDePaginas.push(paginaAtual);
              const indexLivre = novaRam.findIndex((p) => p === null);
              novaRam[indexLivre] = paginaAtual;
            }
          }
        }
      });

      // Atualiza o estado da RAM
      setRam([...novaRam]);

      // Chama a função novamente após o intervalo
      setTimeout(() => atualizarRam(clock + 1), interval);
    };

    // Inicia a atualização da RAM
    atualizarRam(0);
  };

  const calcularPaginacaoLRU = () => {
    const maxClockLength = Math.max(...processos.map((p) => p.clocks.length));
    const interval = (animationTime * 1000) / maxClockLength;

    const ramSize = 50; // Tamanho da RAM
    const lruMap = new Map(); // Mapa para gerenciar as páginas na RAM e suas últimas utilizações

    // Inicializa a RAM com null
    let novaRam = Array(ramSize).fill(null);

    const atualizarRam = (clock) => {
      if (clock >= maxClockLength) return;

      processos.forEach((processo) => {
        const estado = processo.clocks[clock];

        if (estado && estado.startsWith('executando')) {
          // Simula a execução do processo e a troca de páginas
          for (let pagina = 0; pagina < processo.paginas; pagina++) {
            const paginaAtual = {
              nomeDoProcesso: processo.nomeDoProcesso,
              indexNoProcesso: pagina + 1,
            };

            // Verifica se a página já está na RAM
            const paginaNaRam = novaRam.find(
              (p) =>
                p &&
                p.nomeDoProcesso === paginaAtual.nomeDoProcesso &&
                p.indexNoProcesso === paginaAtual.indexNoProcesso
            );

            if (paginaNaRam) {
              // Atualiza a última utilização da página
              lruMap.delete(paginaAtual);
              lruMap.set(paginaAtual, clock);
            } else {
              // Se a RAM estiver cheia, remove a página menos recentemente usada (LRU)
              if (lruMap.size >= ramSize) {
                const paginaLRU = [...lruMap.entries()].reduce((a, b) => (a[1] < b[1] ? a : b))[0];
                lruMap.delete(paginaLRU);
                novaRam = novaRam.map((p) =>
                  p === paginaLRU ? null : p
                );
              }

              // Adiciona a nova página na RAM e no mapa LRU
              lruMap.set(paginaAtual, clock);
              const indexLivre = novaRam.findIndex((p) => p === null);
              novaRam[indexLivre] = paginaAtual;
            }
          }
        }
      });

      // Atualiza o estado da RAM
      setRam([...novaRam]);

      // Chama a função novamente após o intervalo
      setTimeout(() => atualizarRam(clock + 1), interval);
    };

    // Inicia a atualização da RAM
    atualizarRam(0);
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
            onChange={handleInputChange}
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
            onChange={handleInputChange}
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
            onChange={handleInputChange}
            min={2}
            required
          />
        </div>


        {/* tempo de animação */}
        <div>
          <label htmlFor="animationTime">
            Temp. Animação (seg):
          </label>
          <input
            type="number"
            id="animationTime"
            value={animationTime}
            onChange={handleInputChange}
            min={0.1}
            step={0.1}
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
        <div>
          <h3>Processos</h3>
          <div className='proccessList'>
            {processos.map((processo, index) => (
              <FichaDoProcesso
                key={index}
                setProcessos={setProcessos}
                processos={processos}
                index={index}
                setMostrarGrafico={setMostrarGrafico}
              />
            ))}
          </div>
        </div>
      )}

      {/* Seleciona tipo de algoritmo */}
      <h3>Algoritmo de Escalonamento</h3>
      <div className='typeSelector'>
        <button
          onClick={() => {
            setMostrarGrafico(false);
            setDisco(Array(100).fill(null)); // resetar o array disco no estado (não testado ainda)
            setRam(Array(50).fill(null)) // resetar o array ram no estado (não testado ainda)
            setTipoDeAlgoritmo('fifo');
          }}
          className={tipoDeAlgoritmo === 'fifo' ? 'active' : ''}
        >
          FIFO
        </button>
        <button
          onClick={() => {
            setMostrarGrafico(false);
            setDisco(Array(100).fill(null)); // resetar o array disco no estado (não testado ainda)
            setRam(Array(50).fill(null)) // resetar o array ram no estado (não testado ainda)
            setTipoDeAlgoritmo('sjf');
          }}
          className={tipoDeAlgoritmo === 'sjf' ? 'active' : ''}
        >
          SJF
        </button>
        <button
          onClick={() => {
            setMostrarGrafico(false);
            setDisco(Array(100).fill(null)); // resetar o array disco no estado (não testado ainda)
            setRam(Array(50).fill(null)) // resetar o array ram no estado (não testado ainda)
            setTipoDeAlgoritmo('rr');
          }}
          className={tipoDeAlgoritmo === 'rr' ? 'active' : ''}
        >
          Round Robin
        </button>
        <button
          onClick={() => {
            setMostrarGrafico(false);
            setDisco(Array(100).fill(null)); // resetar o array disco no estado (não testado ainda)
            setRam(Array(50).fill(null)) // resetar o array ram no estado (não testado ainda)
            setTipoDeAlgoritmo('edf');
          }}
          className={tipoDeAlgoritmo === 'edf' ? 'active' : ''}
        >
          EDF
        </button>
      </div>

      {/* Seleciona tipo de paginação */}
      <h3>Algoritmo de Paginação</h3>
      <div className='typeSelector'>
        <button
          onClick={() => {
            setMostrarGrafico(false);
            setDisco(Array(100).fill(null)); // resetar o array disco no estado (não testado ainda)
            setRam(Array(50).fill(null)) // resetar o array ram no estado (não testado ainda)
            setAlgoritmoPaginacao('fifo');
          }}
          className={algoritmoPaginacao === 'fifo' ? 'active' : ''}
        >
          FIFO
        </button>
        <button
          onClick={() => {
            setMostrarGrafico(false);
            setDisco(Array(100).fill(null)); // resetar o array disco no estado (não testado ainda)
            setRam(Array(50).fill(null)) // resetar o array ram no estado (não testado ainda)
            setAlgoritmoPaginacao('lru');
          }}
          className={algoritmoPaginacao === 'lru' ? 'active' : ''}
        >
          SJF
        </button>
      </div>
      
      {/* Botão ativar cálculo */}
      <button
        className='basicButton'
        onClick={() => {
          // Verifica e define valores default
          if (!quantum) setQuantum(1);
          if (sobrecarga === undefined) setSobrecarga(0);

          // Atualiza os processos com valores default
          const processosAtualizados = processos.map((processo, index) => {
            const letra = String.fromCharCode(65 + index); // Converte 0->A, 1->B, 2->C, etc.
            const novoNome = !processo.nomeDoProcesso || processo.nomeDoProcesso.trim() === '' ? letra : processo.nomeDoProcesso;

            return {
              ...processo,
              nomeDoProcesso: novoNome,
              tempoDeChegada: processo.tempoDeChegada || 0,
              tempoDeExecucao: processo.tempoDeExecucao || 1,
              deadLine: processo.deadLine || 0,
              clocks: processo.clocks || []
            };
          });

          // Preenche o array disco
          const novoDiscoArray = Array(120).fill(null);
          let currentIndex = 0;

          processosAtualizados.forEach(processo => {
            for (let i = 0; i < processo.paginas; i++) {
              if (currentIndex < 120) {
                novoDiscoArray[currentIndex] = {
                  nomeDoProcesso: processo.nomeDoProcesso,
                  indexNoProcesso: i + 1,
                };
                currentIndex++;
              }
            }
          });

          setDisco(novoDiscoArray);
          setProcessos(processosAtualizados);

          // Executa o algoritmo após a atualização dos processos
          setTimeout(() => {
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
            setMostrarGrafico(true);
          }, 0);

          // Executa o algoritmo de paginação após o escalonamento
          setTimeout(() => {
            switch (algoritmoPaginacao) {
              case 'fifo':
                calcularPaginacaoFIFO();
                break;
              case 'lru':
                calcularPaginacaoLRU();
                break;
              default:
                break;
            }
          }, 100);

          setTimeout(() => {
            graficoRef.current?.animarLinha();
          }, 200);
        }}
      >
        Calcular Escalonamento
      </button>

      {/* gráfico */}
      {(processos.length > 0 && processos[0].clocks && mostrarGrafico) && (
        <div className="gantt-container">
          <GraficoGantt 
            ref={graficoRef}
            processos={processos} 
            animationTime={animationTime}
          />
        </div>
      )}

      {/* Memoria e Disco */}
      {mostrarGrafico && (<div className='memoria'>
        <div className='area'>
          <h3>DISCO</h3>
          <div className='disco'>
            {disco.map((e, index) => (
              <div key={index} className='celula'>
                {e != null ? (
                  <>
                    <p className='celProcName'>{e.nomeDoProcesso}</p>
                    <p className='celProcIndex'>{e.indexNoProcesso}</p>
                  </>
                ) : <p>{index}</p>}
              </div>
            ))}
          </div>
        </div>
        <div className="area">
          <h3>RAM</h3>
          <div className='ram'>
            {ram.map((e, index) => <div key={index} className='celula'>
              {e != null ? (
                <>
                  <p className='celProcName'>{e.nomeDoProcesso}</p>
                  <p className='celProcIndex'>{e.indexNoProcesso}</p>
                </>
              ) : <p>{index}</p>}
            </div>)}
          </div>
        </div>
      </div>)}


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
          <p>{algoritmoPaginacao}</p>
        </div>
      )} */}

    </main>
  );
}

export default App;