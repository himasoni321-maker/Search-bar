import { ReaderDocument } from '../types';

export const SAMPLE_DOCUMENTS: ReaderDocument[] = [
  {
    id: 'pdf-quantum',
    title: 'Fault-Tolerant Quantum Architecture & Error Correction',
    type: 'pdf',
    category: 'Physics & Computer Science',
    readTime: '6 min read',
    source: 'Journal of Advanced Quantum Systems, Vol. 14',
    author: 'Dr. Elena Rostova & Prof. Marcus Vance',
    date: 'March 2026',
    content: `Abstract:
The realization of scalable quantum computation remains intrinsically bounded by decoherence and quantum gate infidelities. In this paper, we delineate a fault-tolerant topological surface architecture that demonstrates exponential suppression of phase and bit-flip errors.

1. Introduction & Theoretical Foundations
Quantum algorithms exploit quantum superposition and quantum entanglement to execute parallel state transitions inaccessible to classical Turing architectures. However, fragile physical qubits suffer from environmental noise, necessitating robust quantum error correction (QEC).

Recent experiments utilizing superconducting transmon circuits exhibit promising coherence times. The topological stabilizer code maps logical qubits across macroscopic two-dimensional planar lattices. By measuring non-destructive syndrome observables, the system reconstructs syndromic error graphs without collapsing the superposed quantum wavefunction.

2. Algorithmic Resilience and Threshold Theorems
According to the fault-tolerance threshold theorem, provided the physical error probability per gate remains beneath a critical threshold (approximately 1%), arbitrarily deep quantum circuits can be evaluated with arbitrarily small failure probability. The computational paradigm introduces non-trivial overheads in ancilla qubit routing and cryogenic latency.

3. Conclusion & Outlook
Future experimental paradigms will integrate photonic interconnects and neuromorphic cryogenic decoders to achieve real-time syndrome processing, thereby transitioning quantum processors from noisy intermediate-scale systems into verifiable universal fault-tolerant processors.`
  },
  {
    id: 'news-energy',
    title: 'Global Renewable Milestone: Solar and Wind Surpass Fossil Baselines',
    type: 'news',
    category: 'Global Environment & Technology',
    readTime: '4 min read',
    source: 'The International Gazette',
    author: 'Sophia Chen, Environmental Correspondent',
    date: 'April 12, 2026',
    content: `GENEVA — In a historic watershed moment for the global clean energy transition, international climate agencies verified today that wind and photovoltaic power generation outpaced coal and natural gas across member nations for the third consecutive quarter.

The acceleration is attributed to unprecedented advances in perovskite-silicon tandem solar cells, which have pushed industrial module efficiency beyond thirty percent. Simultaneously, the deployment of massive grid-scale iron-air battery storage has alleviated long-standing curtailment dilemmas.

"We are witnessing a monumental paradigm shift," declared Dr. Aris Thorne, Director of the Sustainable Energy Initiative. "What was once dismissed as intermittent and financially precarious has emerged as the definitive backbone of modern industrial power grids."

Despite persistent geopolitical volatility and supply chain friction for rare earth catalysts, municipal investments in decentralized microgrids have demonstrated exceptional resilience against extreme weather anomalies.`
  },
  {
    id: 'book-literature',
    title: 'The Picture of Dorian Gray & The Enigma of Modernity',
    type: 'book',
    category: 'Literature & Philosophy',
    readTime: '5 min read',
    source: 'Victorian Aestheticism Quarterly',
    author: 'Analysis of Classical Prose',
    date: 'Classic Edition',
    content: `The studio was filled with the rich odour of roses, and when the light summer wind stirred amidst the trees of the garden, there came through the open door the heavy scent of the lilac, or the more delicate perfume of the pink-flowering thorn.

From the corner of the divan of Persian saddle-bags on which he was lying, smoking innumerable cigarettes, Lord Henry Wotton could just catch the gleam of the honey-sweet and honey-coloured blossoms of a laburnum, whose tremulous branches seemed hardly able to bear the burden of a beauty so flame-like and ephemeral.

"It is your best work, Basil, the best thing you have ever done," said Lord Henry languidly. "You must certainly send it next year to the Grosvenor. The Academy is too large and too vulgar. Whenever I have gone there, there have been either so many people that I have not been able to see the pictures, which was dreadful, or so many pictures that I have not been able to see the people, which was worse."

Basil Hallward looked at him with an enigmatic melancholy. "I know you will laugh at me," he confessed, "but I really cannot exhibit it. I have put too much of myself into it. An artist should create beautiful things, but should put nothing of his own life into them."`
  },
  {
    id: 'wiki-neural',
    title: 'Artificial Neural Networks & Synaptic Plasticity',
    type: 'wiki',
    category: 'Computational Neuroscience',
    readTime: '5 min read',
    source: 'Wikipedia Encyclopedia',
    author: 'Collaborative Knowledge Base',
    date: 'Updated Today',
    content: `An artificial neural network (ANN) is a computational model inspired by the biological neural circuits that constitute animal brains. An ANN is based on a collection of connected units or nodes called artificial neurons, which loosely model the neurons in a biological brain.

Each connection, like the synapses in a biological brain, can transmit a signal to other neurons. An artificial neuron receives signals, processes them, and can signal neurons connected to it. The "signal" at a connection is a real number, and the output of each neuron is computed by some non-linear function of the sum of its inputs.

Connections typically have a weight that adjusts as learning proceeds. The weight increases or decreases the strength of the signal at a connection. Neurons may have a threshold such that a signal is sent only if the aggregate signal crosses that threshold. Typically, neurons are aggregated into layers. Different layers may perform different transformations on their inputs. Signals travel from the first layer (the input layer) to the last layer (the output layer), possibly after traversing the layers multiple times.`
  }
];
