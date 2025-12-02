import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stage, PresentationControls } from '@react-three/drei';

const Ring = ({ metal, gemstone, gemstoneSize }) => {
    const ringRef = useRef();

    const metalColors = {
        'Gold': '#FFD700',
        'Rose Gold': '#B76E79',
        'White Gold': '#F0F8FF',
        'Platinum': '#E5E4E2',
        'Silver': '#C0C0C0'
    };

    const gemColors = {
        'Diamond': '#E0F6FF',
        'Ruby': '#E0115F',
        'Sapphire': '#0F52BA',
        'Emerald': '#50C878',
        'None': null
    };

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        ringRef.current.rotation.y = Math.sin(t / 4) / 8;
        ringRef.current.rotation.x = Math.cos(t / 4) / 8;
    });

    return (
        <group ref={ringRef} dispose={null}>
            <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[2, 0.2, 16, 100]} />
                <meshStandardMaterial
                    color={metalColors[metal] || '#FFD700'}
                    metalness={0.9}
                    roughness={0.1}
                />
            </mesh>

            {gemstone !== 'None' && (
                <group position={[0, 2.2, 0]}>
                    <mesh castShadow receiveShadow position={[0, -0.1, 0]}>
                        <cylinderGeometry args={[0.3, 0.1, 0.3, 4]} />
                        <meshStandardMaterial
                            color={metalColors[metal] || '#FFD700'}
                            metalness={0.9}
                            roughness={0.1}
                        />
                    </mesh>
                    <mesh castShadow receiveShadow position={[0, 0.1, 0]}>
                        <dodecahedronGeometry args={[0.3 + (gemstoneSize * 0.1)]} />
                        <meshPhysicalMaterial
                            color={gemColors[gemstone]}
                            transmission={0.6}
                            opacity={0.9}
                            metalness={0.1}
                            roughness={0}
                            ior={2.4}
                            thickness={0.5}
                        />
                    </mesh>
                </group>
            )}
        </group>
    );
};

const Necklace = ({ metal, gemstone, gemstoneSize }) => {
    const necklaceRef = useRef();

    const metalColors = {
        'Gold': '#FFD700',
        'Rose Gold': '#B76E79',
        'White Gold': '#F0F8FF',
        'Platinum': '#E5E4E2',
        'Silver': '#C0C0C0'
    };

    const gemColors = {
        'Diamond': '#E0F6FF',
        'Ruby': '#E0115F',
        'Sapphire': '#0F52BA',
        'Emerald': '#50C878',
        'None': null
    };

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        necklaceRef.current.rotation.y = Math.sin(t / 4) / 8;
    });

    return (
        <group ref={necklaceRef} dispose={null}>
            {/* Chain */}
            <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[3, 0.08, 16, 100, Math.PI * 1.5]} />
                <meshStandardMaterial
                    color={metalColors[metal] || '#FFD700'}
                    metalness={0.9}
                    roughness={0.1}
                />
            </mesh>

            {/* Pendant */}
            {gemstone !== 'None' ? (
                <group position={[0, -3.5, 0]}>
                    <mesh castShadow receiveShadow>
                        <sphereGeometry args={[0.4 + (gemstoneSize * 0.1), 32, 32]} />
                        <meshPhysicalMaterial
                            color={gemColors[gemstone]}
                            transmission={0.6}
                            opacity={0.9}
                            metalness={0.1}
                            roughness={0}
                            ior={2.4}
                            thickness={0.5}
                        />
                    </mesh>
                </group>
            ) : (
                <group position={[0, -3.5, 0]}>
                    <mesh castShadow receiveShadow>
                        <cylinderGeometry args={[0.3, 0.3, 0.6, 6]} />
                        <meshStandardMaterial
                            color={metalColors[metal] || '#FFD700'}
                            metalness={0.9}
                            roughness={0.1}
                        />
                    </mesh>
                </group>
            )}
        </group>
    );
};

const Earrings = ({ metal, gemstone, gemstoneSize }) => {
    const earringsRef = useRef();

    const metalColors = {
        'Gold': '#FFD700',
        'Rose Gold': '#B76E79',
        'White Gold': '#F0F8FF',
        'Platinum': '#E5E4E2',
        'Silver': '#C0C0C0'
    };

    const gemColors = {
        'Diamond': '#E0F6FF',
        'Ruby': '#E0115F',
        'Sapphire': '#0F52BA',
        'Emerald': '#50C878',
        'None': null
    };

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        earringsRef.current.rotation.y = Math.sin(t / 4) / 8;
    });

    return (
        <group ref={earringsRef} dispose={null}>
            {/* Left Earring */}
            <group position={[-1.5, 0, 0]}>
                <mesh castShadow receiveShadow>
                    <torusGeometry args={[0.3, 0.05, 16, 32]} />
                    <meshStandardMaterial
                        color={metalColors[metal] || '#FFD700'}
                        metalness={0.9}
                        roughness={0.1}
                    />
                </mesh>
                {gemstone !== 'None' && (
                    <mesh castShadow receiveShadow position={[0, -0.5, 0]}>
                        <sphereGeometry args={[0.2 + (gemstoneSize * 0.05), 32, 32]} />
                        <meshPhysicalMaterial
                            color={gemColors[gemstone]}
                            transmission={0.6}
                            opacity={0.9}
                            metalness={0.1}
                            roughness={0}
                            ior={2.4}
                            thickness={0.5}
                        />
                    </mesh>
                )}
            </group>

            {/* Right Earring */}
            <group position={[1.5, 0, 0]}>
                <mesh castShadow receiveShadow>
                    <torusGeometry args={[0.3, 0.05, 16, 32]} />
                    <meshStandardMaterial
                        color={metalColors[metal] || '#FFD700'}
                        metalness={0.9}
                        roughness={0.1}
                    />
                </mesh>
                {gemstone !== 'None' && (
                    <mesh castShadow receiveShadow position={[0, -0.5, 0]}>
                        <sphereGeometry args={[0.2 + (gemstoneSize * 0.05), 32, 32]} />
                        <meshPhysicalMaterial
                            color={gemColors[gemstone]}
                            transmission={0.6}
                            opacity={0.9}
                            metalness={0.1}
                            roughness={0}
                            ior={2.4}
                            thickness={0.5}
                        />
                    </mesh>
                )}
            </group>
        </group>
    );
};

const Bracelet = ({ metal, gemstone, gemstoneSize }) => {
    const braceletRef = useRef();

    const metalColors = {
        'Gold': '#FFD700',
        'Rose Gold': '#B76E79',
        'White Gold': '#F0F8FF',
        'Platinum': '#E5E4E2',
        'Silver': '#C0C0C0'
    };

    const gemColors = {
        'Diamond': '#E0F6FF',
        'Ruby': '#E0115F',
        'Sapphire': '#0F52BA',
        'Emerald': '#50C878',
        'None': null
    };

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        braceletRef.current.rotation.y = Math.sin(t / 4) / 8;
        braceletRef.current.rotation.x = Math.cos(t / 4) / 8;
    });

    return (
        <group ref={braceletRef} dispose={null}>
            <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[2.5, 0.15, 16, 100]} />
                <meshStandardMaterial
                    color={metalColors[metal] || '#FFD700'}
                    metalness={0.9}
                    roughness={0.1}
                />
            </mesh>

            {gemstone !== 'None' && (
                <>
                    {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, idx) => (
                        <group key={idx} position={[
                            Math.cos(angle) * 2.5,
                            Math.sin(angle) * 2.5,
                            0.2
                        ]}>
                            <mesh castShadow receiveShadow>
                                <sphereGeometry args={[0.15 + (gemstoneSize * 0.03), 16, 16]} />
                                <meshPhysicalMaterial
                                    color={gemColors[gemstone]}
                                    transmission={0.6}
                                    opacity={0.9}
                                    metalness={0.1}
                                    roughness={0}
                                    ior={2.4}
                                    thickness={0.5}
                                />
                            </mesh>
                        </group>
                    ))}
                </>
            )}
        </group>
    );
};

const Preview3D = ({ type = 'Ring', metal, gemstone, gemstoneSize }) => {
    const renderJewellery = () => {
        switch (type) {
            case 'Necklace':
                return <Necklace metal={metal} gemstone={gemstone} gemstoneSize={gemstoneSize} />;
            case 'Earrings':
                return <Earrings metal={metal} gemstone={gemstone} gemstoneSize={gemstoneSize} />;
            case 'Bracelet':
                return <Bracelet metal={metal} gemstone={gemstone} gemstoneSize={gemstoneSize} />;
            case 'Ring':
            default:
                return <Ring metal={metal} gemstone={gemstone} gemstoneSize={gemstoneSize} />;
        }
    };

    return (
        <div style={{ width: '100%', height: '400px', background: '#f0f0f0', borderRadius: '12px', overflow: 'hidden' }}>
            <Canvas shadows dpr={[1, 2]} camera={{ fov: 45 }}>
                <PresentationControls speed={1.5} global zoom={0.7} polar={[-0.1, Math.PI / 4]}>
                    <Stage environment="city" intensity={0.6} contactShadow={false}>
                        {renderJewellery()}
                    </Stage>
                </PresentationControls>
                <OrbitControls makeDefault minPolar={0} maxPolar={Math.PI / 1.75} />
            </Canvas>
        </div>
    );
};

export default Preview3D;
