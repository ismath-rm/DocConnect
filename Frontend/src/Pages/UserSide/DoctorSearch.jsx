import DoctorContainer from '../../Components/userside/DoctorContainer';
import { Fragment, useState } from "react";
import { Dialog, Disclosure, Menu, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
    ChevronDownIcon,
    FunnelIcon,
    MinusIcon,
    PlusIcon,
    Squares2X2Icon,
} from "@heroicons/react/20/solid";

const sortOptions = [
    { name: "Best Rating", href: "#", current: false },
    { name: "Fees: Low to High", href: "#", current: false },
    { name: "Fees: High to Low", href: "#", current: false },
];

const filters = [
    {
        id: "gender",
        name: "Gender",
        options: [
            { value: "male", label: "male", checked: false },
            { value: "female", label: "female", checked: false },
        ],
    },
    {
        id: "specialization",
        name: "specialization",
        options: [
            { value: "cardiologist", label: "Cardiologist", checked: false },
            { value: "dermatologist", label: "Dermatologist", checked: false },
            { value: "neurologist", label: "Neurologist", checked: false },
            {
                value: "orthopedic-surgeon",
                label: "Orthopedic Surgeon",
                checked: false,
            },
            { value: "ophthalmologist", label: "Ophthalmologist", checked: false },
            {
                value: "gastroenterologist",
                label: "Gastroenterologist",
                checked: false,
            },
            { value: "endocrinologist", label: "Endocrinologist", checked: false },
            { value: "pulmonologist", label: "Pulmonologist", checked: false },
            { value: "nephrologist", label: "Nephrologist", checked: false },
            { value: "pediatrician", label: "Pediatrician", checked: false },
            { value: "psychiatrist", label: "Psychiatrist", checked: false },
            { value: "general", label: "General", checked: true },
            { value: "rheumatologist", label: "Rheumatologist", checked: false },
            { value: "hematologist", label: "Hematologist", checked: false },
            { value: "urologist", label: "Urologist", checked: false },
            { value: "otolaryngologist", label: "Otolaryngologist", checked: false },
            { value: "radiologist", label: "Radiologist", checked: false },
        ],
    },

];

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

function DoctorSearch() {
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState({
        gender: [], 
        specialization: [], 

    });

    const handleFilterChange = (category, value) => {
        try {
            setSelectedFilters((prevFilters) => {
                const updatedFilters = { ...prevFilters, [category]: [...(prevFilters[category] || [])] };

                const filterIndex = updatedFilters[category].indexOf(value);

                if (filterIndex !== -1) {                   
                    updatedFilters[category].splice(filterIndex, 1);
                } else {
                    updatedFilters[category].push(value);
                }

                console.log("Updated Filters:", updatedFilters);

                return updatedFilters;
            });
        } catch (error) {
            console.error("Error in handleFilterChange:", error);
        }
    };



    return (
        <div className="bg-slate-100">
            <div>
                
                <Transition.Root show={mobileFiltersOpen} as={Fragment}>
                    <Dialog
                        as="div"
                        className="relative z-40 lg:hidden"
                        onClose={setMobileFiltersOpen}
                    >
                        <Transition.Child
                            as={Fragment}
                            enter="transition-opacity ease-linear duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="transition-opacity ease-linear duration-300"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-black bg-opacity-25" />
                        </Transition.Child>

                        <div className="fixed inset-0 z-40 flex">
                            <Transition.Child
                                as={Fragment}
                                enter="transition ease-in-out duration-300 transform"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transition ease-in-out duration-300 transform"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <Dialog.Panel className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-12 shadow-xl">
                                    <div className="flex items-center justify-between px-4">
                                        <h2 className="text-lg font-medium text-gray-900">
                                            Filters
                                        </h2>
                                        <button
                                            type="button"
                                            className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md bg-white p-2 text-gray-400"
                                            onClick={() => setMobileFiltersOpen(false)}
                                        >
                                            <span className="sr-only">Close menu</span>
                                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                        </button>
                                    </div>

                                    
                                    <form className="mt-4 border-t border-gray-200">
                                        <h3 className="sr-only">Categories</h3>

                                        {filters.map((section) => (
                                            <Disclosure
                                                as="div"
                                                key={section.id}
                                                className="border-t border-gray-200 px-4 py-6"
                                            >
                                                {({ open }) => (
                                                    <>
                                                        <h3 className="-mx-2 -my-3 flow-root">
                                                            <Disclosure.Button className="flex w-full items-center justify-between bg-white px-2 py-3 text-gray-400 hover:text-gray-500">
                                                                <span className="font-medium text-gray-900">
                                                                    {section.name}
                                                                </span>
                                                                <span className="ml-6 flex items-center">
                                                                    {open ? (
                                                                        <MinusIcon
                                                                            className="h-5 w-5"
                                                                            aria-hidden="true"
                                                                        />
                                                                    ) : (
                                                                        <PlusIcon
                                                                            className="h-5 w-5"
                                                                            aria-hidden="true"
                                                                        />
                                                                    )}
                                                                </span>
                                                            </Disclosure.Button>
                                                        </h3>
                                                        <Disclosure.Panel className="pt-6">
                                                            <div className="space-y-6">
                                                                {section.options.map((option, optionIdx) => (
                                                                    <div
                                                                        key={option.value}
                                                                        className="flex items-center"
                                                                    >
                                                                        <input
                                                                            id={`filter-mobile-${section.id}-${optionIdx}`}
                                                                            name={`${section.id}[]`}
                                                                            defaultValue={option.value}
                                                                            type="checkbox"
                                                                            checked={selectedFilters[
                                                                                section.id
                                                                            ]?.includes(option.value)}
                                                                            onChange={() =>
                                                                                handleFilterChange(
                                                                                    section.id,
                                                                                    option.value
                                                                                )
                                                                            }
                                                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                        />
                                                                        <label
                                                                            htmlFor={`filter-mobile-${section.id}-${optionIdx}`}
                                                                            className="ml-3 min-w-0 flex-1 text-gray-500"
                                                                        >
                                                                            {option.label}
                                                                        </label>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </Disclosure.Panel>
                                                    </>
                                                )}
                                            </Disclosure>
                                        ))}
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </Dialog>
                </Transition.Root>

                <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-baseline justify-between border-b border-gray-200 pb-6 pt-24">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                            Doctor Search{" "}
                        </h1>

                        <div className="flex items-center">
                            <Menu as="div" className="relative inline-block text-left">
                                

                                <Transition
                                    as={Fragment}
                                    enter="transition ease-out duration-100"
                                    enterFrom="transform opacity-0 scale-95"
                                    enterTo="transform opacity-100 scale-100"
                                    leave="transition ease-in duration-75"
                                    leaveFrom="transform opacity-100 scale-100"
                                    leaveTo="transform opacity-0 scale-95"
                                >
                                    <Menu.Items className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none">
                                        <div className="py-1">
                                            {sortOptions.map((option) => (
                                                <Menu.Item key={option.name}>
                                                    {({ active }) => (
                                                        <a
                                                            href={option.href}
                                                            className={classNames(
                                                                option.current
                                                                    ? "font-medium text-gray-900"
                                                                    : "text-gray-500",
                                                                active ? "bg-gray-100" : "",
                                                                "block px-4 py-2 text-sm"
                                                            )}
                                                        >
                                                            {option.name}
                                                        </a>
                                                    )}
                                                </Menu.Item>
                                            ))}
                                        </div>
                                    </Menu.Items>
                                </Transition>
                            </Menu>

                            <button
                                type="button"
                                className="-m-2 ml-5 p-2 text-gray-400 hover:text-gray-500 sm:ml-7"
                            >
                                <span className="sr-only">View grid</span>
                                <Squares2X2Icon className="h-5 w-5" aria-hidden="true" />
                            </button>
                            <button
                                type="button"
                                className="-m-2 ml-4 p-2 text-gray-400 hover:text-gray-500 sm:ml-6 lg:hidden"
                                onClick={() => setMobileFiltersOpen(true)}
                            >
                                <span className="sr-only">Filters</span>
                                <FunnelIcon className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </div>
                    </div>

                    <section aria-labelledby="products-heading" className="pb-24 pt-6">
                        <h2 id="products-heading" className="sr-only">
                            Products
                        </h2>

                        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
                            
                            <form className="hidden lg:block">
                                <h3 className="sr-only">Categories</h3>

                                {filters.map((section) => (
                                    <Disclosure
                                        as="div"
                                        key={section.id}
                                        className="border-t border-gray-200 px-4 py-6"
                                    >
                                        {({ open }) => (
                                            <>
                                                <h3 className="-mx-2 -my-3 flow-root">
                                                    <Disclosure.Button className="flex w-full items-center justify-between bg-white px-2 py-3 text-gray-400 hover:text-gray-500">
                                                        <span className="font-medium text-gray-900">
                                                            {section.name}
                                                        </span>
                                                        <span className="ml-6 flex items-center">
                                                            {open ? (
                                                                <MinusIcon
                                                                    className="h-5 w-5"
                                                                    aria-hidden="true"
                                                                />
                                                            ) : (
                                                                <PlusIcon
                                                                    className="h-5 w-5"
                                                                    aria-hidden="true"
                                                                />
                                                            )}
                                                        </span>
                                                    </Disclosure.Button>
                                                </h3>
                                                <Disclosure.Panel className="pt-6">
                                                    <div className="space-y-6">
                                                        {section.options.map((option, optionIdx) => (
                                                            <div
                                                                key={option.value}
                                                                className="flex items-center"
                                                            >
                                                                <input
                                                                    id={`filter-mobile-${section.id}-${optionIdx}`}
                                                                    name={`${section.id}[]`}
                                                                    defaultValue={option.value}
                                                                    type="checkbox"
                                                                    checked={selectedFilters[
                                                                        section.id
                                                                    ]?.includes(option.value)}
                                                                    onChange={() =>
                                                                        handleFilterChange(
                                                                            section.id,
                                                                            option.value
                                                                        )
                                                                    }
                                                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                />
                                                                <label
                                                                    htmlFor={`filter-mobile-${section.id}-${optionIdx}`}
                                                                    className="ml-3 min-w-0 flex-1 text-gray-500"
                                                                >
                                                                    {option.label}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </Disclosure.Panel>
                                            </>
                                        )}
                                    </Disclosure>
                                ))}
                            </form>

                            
                            <div className="lg:col-span-3">
                                <DoctorContainer selectedFilters={selectedFilters} />
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}

export default DoctorSearch;