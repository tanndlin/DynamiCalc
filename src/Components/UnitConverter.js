import React from 'react';
import Converter from 'convert-units';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

const UnitConverter = () => {
    const [value, setValue] = React.useState('0ft');
    const [toUnit, setToUnit] = React.useState('m');

    const convert = (value, toUnit) => {
        try {
            // Get alphabet characters from string
            const intValue = value.replace(/[a-zA-Z]/g, '');
            const fromUnit = value.replace(intValue, '');

            if (!toUnit || toUnit === 'Best') {
                const { val, unit } = Converter(intValue)
                    .from(fromUnit)
                    .toBest();
                return `${val} ${unit}`;
            }

            return `${Converter(intValue).from(fromUnit).to(toUnit)} ${toUnit}`;
        } catch (error) {
            return 'Error';
        }
    };

    const getPossibleUnits = (value) => {
        try {
            const fromUnit = value.replace(/[0-9]/g, '');
            return ['Best', ...Converter().from(fromUnit).possibilities()];
        } catch {
            return [];
        }
    };

    return (
        <div className="flex flex-col gap-8 pb-8 px-8">
            <h1 className="text-center text-3xl font-bold mt-4 mb-8">
                Unit Converter
            </h1>
            <div className=" mx-auto grid grid-rows-2 gap-2">
                <span>
                    <label className="text-xl" htmlFor=" from">
                        From
                    </label>
                    <input
                        className="w-full rounded-md text-black py-1 px-2"
                        type="text"
                        value={value}
                        onChange={(e) => {
                            if (e.target.value === '') {
                                setToUnit('Best');
                            }

                            setValue(e.target.value);
                        }}
                    />
                </span>
                <span>
                    <label className="text-xl" htmlFor=" to">
                        To
                    </label>
                    <Dropdown
                        options={getPossibleUnits(value)}
                        value={toUnit}
                        onChange={(e) => setToUnit(e.value)}
                        className="rounded-md"
                        controlClassName="rounded-md"
                        menuClassName="rounded-md"
                    />
                </span>
            </div>
            <div className="bg-secondary rounded-md conatiner p-4 flex flex-col">
                <h2 className="text-center text-xl mb-2">Result</h2>
                <span className="text-center mx-auto">
                    {convert(value, toUnit)}
                </span>
            </div>
        </div>
    );
};

export default UnitConverter;
